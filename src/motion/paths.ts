import {
  evolvePath,
  getLength,
  getPointAtLength,
  getTangentAtLength,
  warpPath,
} from '@remotion/paths';
import {
  curveBasisClosed,
  curveCatmullRom,
  curveCatmullRomClosed,
  line,
} from 'd3-shape';
import {noise} from './noise';

/**
 * Geometry engine. d3-shape builds curves from points; @remotion/paths
 * measures, draws and warps them. Everything here is a pure function of its
 * inputs: call it with the frame, get a path string back.
 */

export type Point = readonly [number, number];

/** Smooth curve through points (Catmull-Rom passes through every point). */
export const smoothPath = (points: Point[], {closed = false, alpha = 0.5} = {}) =>
  line<Point>()
    .curve(closed ? curveCatmullRomClosed.alpha(alpha) : curveCatmullRom.alpha(alpha))(points) ?? '';

/**
 * Organic closed form. `irregularity` is a fraction of the radius: 0.02 = 2%.
 * Advance `time` (e.g. frame / 90) to make it breathe.
 */
export function blob({
  cx,
  cy,
  r,
  seed,
  irregularity = 0.02,
  time = 0,
  points = 12,
  squash = 1,
}: {
  cx: number;
  cy: number;
  r: number;
  seed: string | number;
  irregularity?: number;
  time?: number;
  points?: number;
  /** Horizontal / vertical ratio. 1 = round. */
  squash?: number;
}) {
  const {n3} = noise(seed);
  const pts: Point[] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const k = 1 + irregularity * n3(Math.cos(a), Math.sin(a), time);
    pts.push([cx + Math.cos(a) * r * k * squash, cy + Math.sin(a) * r * k]);
  }
  return line<Point>().curve(curveBasisClosed)(pts) ?? '';
}

/**
 * Displace every point of any path with seeded noise, perpendicular-agnostic.
 * `amount` in px. Keep it at 1–3% of the shape's size.
 */
export const wobble = (
  d: string,
  {amount, seed, time = 0, scale = 0.004}: {amount: number; seed: string | number; time?: number; scale?: number},
) => {
  const {n3} = noise(seed);
  return warpPath(
    d,
    ({x, y}) => ({
      x: x + amount * n3(x * scale, y * scale, time),
      y: y + amount * n3(x * scale + 31.7, y * scale - 12.4, time),
    }),
    {interpolationThreshold: 8},
  );
};

/**
 * Stroke drawing, DrawSVG-style: show the segment [start, end] of the path,
 * both in 0–1. Spread the result onto a <path> with a stroke.
 */
export const drawSegment = (d: string, start: number, end: number) => {
  const length = getLength(d);
  const visible = Math.max(0, end - start) * length;
  return {
    strokeDasharray: `${visible} ${length}`,
    strokeDashoffset: -start * length,
  };
};

/** Shorthand when drawing from the start of the path. */
export const drawIn = (d: string, t: number) => evolvePath(t, d);

/** Position and heading on a path at t ∈ [0, 1] (MotionPath replacement). */
export const alongPath = (d: string, t: number) => {
  const at = Math.min(Math.max(t, 0), 1) * getLength(d);
  const p = getPointAtLength(d, at) ?? {x: 0, y: 0};
  const tan = getTangentAtLength(d, at) ?? {x: 1, y: 0};
  return {x: p.x, y: p.y, angle: (Math.atan2(tan.y, tan.x) * 180) / Math.PI};
};
