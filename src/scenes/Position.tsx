import {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Grain} from '../graphics/Grain';
import {Shape} from '../graphics/Shape';
import {CameraSvg, REST} from '../motion/camera';
import {glide, travel, useGsapTimeline} from '../motion/easing';
import {convergeShapes} from '../motion/morph';
import {blob, wobble} from '../motion/paths';
import {FPS, progress, sec, stagger} from '../motion/timing';
import {color} from '../theme';
import {useGlyphs} from '../typography/GlyphPath';

/**
 * POSITION: the word is drawn, holds, then its contours collapse into a
 * single organic form that starts to breathe.
 *
 * Status: technical proof of the kit (glyph geometry, many-to-one morph,
 * frame-driven GSAP, seeded noise, camera). Timings and form are
 * placeholders until DIRECTION.md is written.
 */
export const POSITION_DURATION = sec(6);

const SIZE = 230;
const CENTER = {x: 960, y: 540};
const MORPH_START = sec(3.1);
const MORPH_DURATION = sec(1.2);
const MORPH_STEP = 3; // frames between letters, centre outwards
const LAST_ORDER = 3; // 8 letters: orders 3,2,1,0,0,1,2,3
const MORPH_END = MORPH_START + LAST_ORDER * MORPH_STEP + MORPH_DURATION;
const SEAM = 6; // frames of crossfade from the stacked contours to the single live form
const BREATH = 90; // frames per unit of noise time

const form = (frame: number) =>
  blob({cx: CENTER.x, cy: CENTER.y, r: 250, squash: 1.15, irregularity: 0.03, points: 10, seed: 'position', time: frame / BREATH});

export const Position = () => {
  const frame = useCurrentFrame();
  const glyphs = useGlyphs('POSITION', {x: CENTER.x, y: CENTER.y + SIZE * 0.36, size: SIZE, tracking: 0.02, align: 'center'});

  // Macro choreography on a frame-driven GSAP timeline (seconds).
  const s = useGsapTimeline({fill: 0, mass: 0, zoom: 1}, (tl, st) => {
    tl.to(st, {fill: 1, duration: 0.8, ease: travel}, 1.0)
      .to(st, {fill: 0, duration: 0.6, ease: travel}, 2.8)
      .to(st, {mass: 1, duration: 1.0, ease: glide}, MORPH_END / FPS - 0.1)
      .to(st, {zoom: 1.06, duration: 6, ease: 'none'}, 0);
  });

  // Every contour of every letter, counters included, converges onto the form.
  const rings = useMemo(
    () => glyphs.flatMap((g, i) => [...g.outer, ...g.holes].map((d) => ({d, order: Math.floor(Math.abs(i - (glyphs.length - 1) / 2))}))),
    [glyphs],
  );
  const morphs = useMemo(() => convergeShapes(rings.map((r) => r.d), form(MORPH_END)), [rings]);

  if (rings.length === 0) return <AbsoluteFill style={{background: color.paper}} />;

  const morphing = frame >= MORPH_START;
  const seam = progress(frame, MORPH_END - SEAM, SEAM);

  return (
    <AbsoluteFill style={{background: color.paper}}>
      <CameraSvg camera={{...REST, zoom: s.zoom}}>
        {!morphing &&
          glyphs.map((g, i) => {
            const draw = progress(frame, stagger(i, 2, sec(0.2)), sec(1.0), glide);
            return (
              <g key={i}>
                <path d={g.d} fill={color.ink} fillOpacity={s.fill} />
                {[...g.outer, ...g.holes].map((ring, k) => (
                  <Shape key={k} d={ring} draw={draw} fill="none" stroke={color.ink} strokeWidth={2} />
                ))}
              </g>
            );
          })}

        {morphing && seam < 1 && (
          <g opacity={1 - seam} fill="none" stroke={color.ink} strokeWidth={2} strokeLinejoin="round">
            {rings.map(({order}, k) => {
              const t = progress(frame, stagger(order, MORPH_STEP, MORPH_START), MORPH_DURATION, glide);
              const d = morphs[k](t);
              // 1–3% irregularity while the type turns organic, zero at both ends.
              const amount = 4 * Math.sin(Math.PI * t);
              return <path key={k} d={amount > 0.01 ? wobble(d, {amount, seed: `position-${k}`, time: frame / BREATH}) : d} />;
            })}
          </g>
        )}

        {seam > 0 && (
          <path
            d={form(Math.max(frame, MORPH_END))}
            fill={color.ink}
            fillOpacity={s.mass}
            stroke={color.ink}
            strokeWidth={2}
            opacity={seam}
          />
        )}
      </CameraSvg>
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
