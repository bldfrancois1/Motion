import type {CSSProperties} from 'react';
import {useCurrentFrame} from 'remotion';
import {glide} from '../motion/easing';
import {mix, progress} from '../motion/timing';
import {color, font} from '../theme';
import {useFontFace} from './fonts';

/**
 * Live text with a restrained tracking-in: letter-spacing closes and a light
 * blur clears on the house `glide` curve. Rewritten from Remocn's TrackingIn
 * (src/vendor/remocn/tracking-in.tsx) without its spring, white background,
 * or 0.5em amplitude. Use for text that must stay text; use GlyphPath when
 * the letters have to become something else.
 */
export const DisplayText = ({
  text,
  size = 120,
  start = 0,
  duration = 36,
  trackingFrom = 0.08,
  trackingTo = -0.01,
  blurFrom = 4,
  fill = color.ink,
  face = font.display,
  style,
}: {
  text: string;
  size?: number;
  /** Frame at which the entrance starts. */
  start?: number;
  duration?: number;
  /** Letter-spacing in em at the start and end of the entrance. */
  trackingFrom?: number;
  trackingTo?: number;
  blurFrom?: number;
  fill?: string;
  face?: {family: string; file: string; weight: number};
  style?: CSSProperties;
}) => {
  useFontFace(face.family, face.file, face.weight);
  const frame = useCurrentFrame();
  const t = progress(frame, start, duration, glide);
  const opacity = progress(frame, start, duration * 0.4);
  return (
    <span
      style={{
        fontFamily: face.family,
        fontWeight: face.weight,
        fontSize: size,
        lineHeight: 1,
        color: fill,
        whiteSpace: 'nowrap',
        letterSpacing: `${mix(trackingFrom, trackingTo, t)}em`,
        filter: blurFrom > 0 ? `blur(${mix(blurFrom, 0, t)}px)` : undefined,
        opacity,
        ...style,
      }}
    >
      {text}
    </span>
  );
};
