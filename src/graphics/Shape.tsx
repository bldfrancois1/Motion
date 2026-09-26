import type {SVGProps} from 'react';
import {drawSegment} from '../motion/paths';

/**
 * A path with the two controls every scene needs: how much of the stroke is
 * drawn, and how much of the fill is visible. Render inside an <svg>.
 */
export const Shape = ({
  d,
  draw,
  fillOpacity = 1,
  ...rest
}: {
  d: string;
  /** [start, end] in 0–1, or a single end value. Omit for a full stroke. */
  draw?: number | readonly [number, number];
  fillOpacity?: number;
} & Omit<SVGProps<SVGPathElement>, 'd'>) => {
  const [start, end] = draw === undefined ? [0, 1] : typeof draw === 'number' ? [0, draw] : draw;
  const dash = draw === undefined || (start <= 0 && end >= 1) ? {} : drawSegment(d, start, end);
  return <path d={d} fillOpacity={fillOpacity} {...dash} {...rest} />;
};
