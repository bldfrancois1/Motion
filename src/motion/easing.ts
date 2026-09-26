import gsap from 'gsap';
import {CustomEase} from 'gsap/CustomEase';
import {useLayoutEffect, useMemo} from 'react';
import {Easing, useCurrentFrame, useVideoConfig} from 'remotion';

gsap.registerPlugin(CustomEase);

/**
 * House curves. Scenes use these names, never ad-hoc beziers.
 *
 * `glide` is the signature: fast departure, long slide, very soft brake,
 * no overshoot. Two cubic segments joined with a continuous tangent at
 * (0.3, 0.86). Tune it against the reference video, not by feel alone.
 */
export const glide = CustomEase.create(
  'glide',
  'M0,0 C0.05,0.35 0.12,0.72 0.3,0.86 0.444,0.972 0.7,1 1,1',
);

/** Symmetric, for elements that travel from one resting place to another. */
export const travel = Easing.bezier(0.65, 0, 0.35, 1);

/** Exits: accelerate away, never decelerate out of frame. */
export const leave = Easing.bezier(0.55, 0, 0.9, 0.4);

/** Linear, for noise time and camera drift only. */
export const linear = (t: number) => t;

/**
 * Frame-driven GSAP timeline.
 *
 * GSAP never runs its own clock here: the timeline is paused, tweens a plain
 * object (never a DOM node), and is seeked to `frame / fps` on every render.
 * Seeking is absolute, so frames can render in any order across tabs and
 * still produce identical output.
 *
 *   const v = useGsapTimeline({draw: 0, fill: 0}, (tl, s) => {
 *     tl.to(s, {draw: 1, duration: 1.2, ease: glide})
 *       .to(s, {fill: 1, duration: 0.6}, '-=0.4');
 *   });
 */
export function useGsapTimeline<T extends Record<string, number>>(
  initial: T,
  build: (tl: gsap.core.Timeline, state: T) => void,
): T {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const {tl, state} = useMemo(() => {
    const s = {...initial};
    const t = gsap.timeline({paused: true, defaults: {lazy: false}});
    build(t, s);
    return {tl: t, state: s};
    // Built once per mount: `initial` and `build` are static by contract.
  }, []);

  useLayoutEffect(() => () => void tl.kill(), [tl]);

  tl.seek(frame / fps, false);
  return {...state};
}
