import type {CSSProperties, ReactNode} from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * Real masks: the content outside the shape is not rendered. Uses CSS
 * clip-path, so the coordinates are the pixels of the full frame.
 */

/** Wipe reveal. `t` 0→1 opens the frame from `from` towards the opposite side. */
export const WipeMask = ({
  t,
  from = 'bottom',
  children,
  style,
}: {
  t: number;
  from?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
  style?: CSSProperties;
}) => {
  const hidden = `${(1 - t) * 100}%`;
  const inset = {
    top: `0 0 ${hidden} 0`,
    bottom: `${hidden} 0 0 0`,
    left: `0 ${hidden} 0 0`,
    right: `0 0 0 ${hidden}`,
  }[from];
  return <AbsoluteFill style={{clipPath: `inset(${inset})`, ...style}}>{children}</AbsoluteFill>;
};

/**
 * Any SVG path as a window onto `children`: a glyph of POSITION revealing
 * the next scene, a form opening onto a shot. Transform the path itself
 * (scale, morph) to animate the opening.
 */
export const PathMask = ({
  d,
  children,
  evenOdd = true,
  style,
}: {
  d: string;
  children: ReactNode;
  /** evenodd keeps the counters of O, P, A... open. */
  evenOdd?: boolean;
  style?: CSSProperties;
}) => (
  <AbsoluteFill style={{clipPath: `path(${evenOdd ? 'evenodd, ' : ''}'${d}')`, ...style}}>
    {children}
  </AbsoluteFill>
);
