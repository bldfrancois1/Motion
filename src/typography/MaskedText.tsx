import type {CSSProperties} from 'react';
import {useCurrentFrame} from 'remotion';
import {glide, leave} from '../motion/easing';
import {progress, stagger} from '../motion/timing';
import {color, font} from '../theme';
import {useFontFace} from './fonts';

/**
 * Lines rising out of a real mask: each line slides up inside its own
 * overflow-hidden box, so nothing is visible below the baseline edge.
 * (Remocn's MaskRevealUp fades and translates without clipping; this clips.)
 */
export const MaskedText = ({
  lines,
  size = 64,
  start = 0,
  duration = 30,
  step = 4,
  exitAt,
  exitDuration = 18,
  fill = color.ink,
  face = font.text,
  align = 'left',
  lineHeight = 1.1,
  style,
}: {
  lines: string[];
  size?: number;
  start?: number;
  duration?: number;
  /** Frames between two lines. */
  step?: number;
  /** Frame at which lines leave upward. Omit to hold. */
  exitAt?: number;
  exitDuration?: number;
  fill?: string;
  face?: {family: string; file: string; weight: number};
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  style?: CSSProperties;
}) => {
  useFontFace(face.family, face.file, face.weight);
  const frame = useCurrentFrame();
  return (
    <div style={{textAlign: align, ...style}}>
      {lines.map((line, i) => {
        const enter = progress(frame, stagger(i, step, start), duration, glide);
        const exit = exitAt === undefined ? 0 : progress(frame, stagger(i, step, exitAt), exitDuration, leave);
        const y = (1 - enter) * 105 - exit * 105;
        return (
          <div key={i} style={{overflow: 'hidden', lineHeight, paddingBottom: '0.08em'}}>
            <div
              style={{
                fontFamily: face.family,
                fontWeight: face.weight,
                fontSize: size,
                color: fill,
                transform: `translateY(${y}%)`,
                whiteSpace: 'nowrap',
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};
