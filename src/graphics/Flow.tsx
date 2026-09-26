import {alongPath, drawSegment} from '../motion/paths';

/**
 * A trajectory that travels rather than appears: a stroke segment of length
 * `tail` whose head is at `head` (both 0–1 along the path), plus an optional
 * marker riding the head. Not an arrow: no arrowheads in this film.
 *
 * Render inside an <svg>. Drive `head` with a house easing.
 */
export const Flow = ({
  d,
  head,
  tail = 1,
  stroke,
  strokeWidth = 2,
  marker,
}: {
  d: string;
  head: number;
  /** Visible length behind the head, 0–1. 1 = everything drawn so far. */
  tail?: number;
  stroke: string;
  strokeWidth?: number;
  marker?: {r: number; fill: string};
}) => {
  const start = Math.max(0, head - tail);
  const tip = alongPath(d, head);
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        {...drawSegment(d, start, head)}
      />
      {marker && head > 0 ? <circle cx={tip.x} cy={tip.y} r={marker.r} fill={marker.fill} /> : null}
    </g>
  );
};
