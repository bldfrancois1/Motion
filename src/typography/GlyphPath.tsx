import {useMemo, type ReactNode} from 'react';
import {font as theme} from '../theme';
import {layoutGlyphs, useGlyphFont, type Glyph} from './fonts';

type LayoutOptions = {
  x?: number;
  y?: number;
  size: number;
  tracking?: number;
  align?: 'left' | 'center' | 'right';
  file?: string;
};

/**
 * The word as geometry: one outline per letter, split into outer contours
 * and counters. Empty array until the font is loaded (rendering is blocked
 * meanwhile, so no frame ever sees the empty state).
 */
export function useGlyphs(text: string, {file = theme.display.file, ...opts}: LayoutOptions): Glyph[] {
  const font = useGlyphFont(file);
  const {x, y, size, tracking, align} = opts;
  return useMemo(
    () => (font ? layoutGlyphs(font, text, {x, y, size, tracking, align}) : []),
    [font, text, x, y, size, tracking, align],
  );
}

/**
 * Render text as SVG paths. Without children, draws each glyph filled.
 * With a render function, you decide per letter: stroke, morph, mask, move.
 * Render inside an <svg>.
 */
export const GlyphPath = ({
  text,
  fill = 'currentColor',
  children,
  ...opts
}: {
  text: string;
  fill?: string;
  children?: (glyph: Glyph, index: number) => ReactNode;
} & LayoutOptions) => {
  const glyphs = useGlyphs(text, opts);
  return (
    <g>
      {glyphs.map((g, i) =>
        children ? (
          <g key={i}>{children(g, i)}</g>
        ) : (
          <path key={i} d={g.d} fill={fill} fillRule="nonzero" />
        ),
      )}
    </g>
  );
};
