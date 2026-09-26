import {AbsoluteFill, useCurrentFrame} from 'remotion';

/**
 * Film grain. feTurbulence reseeded from the frame number: deterministic,
 * no canvas, no assets. `every` holds each grain pattern for n frames
 * (2 reads as film at 30 fps, 1 as video noise).
 *
 * Keep opacity between 0.03 and 0.08. Visible grain is a style decision,
 * not a default.
 */
export const Grain = ({
  opacity = 0.05,
  every = 2,
  frequency = 0.85,
  blend = 'overlay',
}: {
  opacity?: number;
  every?: number;
  frequency?: number;
  blend?: 'overlay' | 'soft-light' | 'multiply' | 'screen';
}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / every) % 997;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: blend, opacity}}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
