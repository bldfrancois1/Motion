import {interpolate, type EasingFunction} from 'remotion';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Seconds → frames. The only way durations are written in this repo. */
export const sec = (seconds: number) => Math.round(seconds * FPS);

/**
 * 0→1 over [start, start + duration], clamped, optionally eased.
 * The workhorse: every animated value derives from one of these.
 */
export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing?: EasingFunction,
) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Start frame of item `index` in a staggered group. */
export const stagger = (index: number, step: number, start = 0) =>
  start + index * step;

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
