import {interpolatePath} from '@remotion/paths';
import {combine, interpolate, separate} from 'flubber';

/**
 * Shape transformation. Two engines, one rule each:
 *
 * - Closed shapes (glyphs, blobs, zones): flubber. Handles different point
 *   counts and one-to-many / many-to-one splits.
 * - Open lines (trajectories, strokes): interpolatePath from @remotion/paths
 *   (a port of d3-interpolate-path). flubber would close them.
 *
 * flubber is expensive: build interpolators once (module scope or useMemo),
 * then call them per frame. Never build one inside the render path.
 */

/** px between resampled points. Lower = smoother, slower to build. */
const RESOLUTION = 3;

/** One closed shape → another. */
export const morphShape = (from: string, to: string) =>
  interpolate(from, to, {maxSegmentLength: RESOLUTION});

/**
 * One closed shape → several (a position splitting into narratives).
 * Returns a single path string per t, so it renders as one <path>.
 */
export const splitShape = (from: string, to: string[]) =>
  separate(from, to, {maxSegmentLength: RESOLUTION, single: true}) as (t: number) => string;

/**
 * Several closed shapes → one, by convergence: every source morphs onto the
 * whole target, so the outlines slide over each other and coincide at t = 1.
 * This is the default for "many become one" (letters collapsing into a form).
 * Returns one interpolator per source; stagger them.
 */
export const convergeShapes = (from: string[], to: string) => from.map((d) => morphShape(d, to));

/**
 * Several closed shapes → one, by assembly: the target is cut into pieces
 * (triangulated) and each source becomes one piece. Reads as shards
 * mid-morph, so reserve it for things that are literally parts of a whole
 * (four zones tiling a territory). At t = 1 crossfade to the plain target to
 * hide the seams.
 */
export const assembleShapes = (from: string[], to: string) =>
  combine(from, to, {maxSegmentLength: RESOLUTION, single: true}) as (t: number) => string;

/** Open line → open line. Cheap: fine to call per frame. */
export const morphLine = (from: string, to: string, t: number) =>
  interpolatePath(t, from, to);
