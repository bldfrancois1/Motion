import {getSubpaths} from '@remotion/paths';
import {parse, type Font} from 'opentype.js';
import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

/**
 * Font loading for both uses of type in this film:
 * - useGlyphFont: the font as geometry (opentype.js), for GlyphPath.
 * - useFontFace: the font as CSS, for DisplayText / MaskedText.
 * Both block rendering until loaded, so no frame is ever drawn with a fallback.
 */

const fonts = new Map<string, Promise<Font>>();
const loadGlyphFont = (file: string) => {
  let p = fonts.get(file);
  if (!p) {
    p = fetch(staticFile(file))
      .then((r) => {
        if (!r.ok) throw new Error(`Font not found: public/${file}`);
        return r.arrayBuffer();
      })
      .then((buf) => parse(buf));
    fonts.set(file, p);
  }
  return p;
};

export function useGlyphFont(file: string): Font | null {
  const [font, setFont] = useState<Font | null>(null);
  const [handle] = useState(() => delayRender(`glyph font ${file}`));
  useEffect(() => {
    loadGlyphFont(file)
      .then((f) => {
        setFont(f);
        continueRender(handle);
      })
      .catch(cancelRender);
  }, [file, handle]);
  return font;
}

const faces = new Map<string, Promise<void>>();
export function useFontFace(family: string, file: string, weight: number) {
  const [handle] = useState(() => delayRender(`font face ${family}`));
  useEffect(() => {
    const key = `${family}:${weight}`;
    let p = faces.get(key);
    if (!p) {
      const face = new FontFace(family, `url(${staticFile(file)})`, {weight: String(weight)});
      p = face.load().then((f) => void document.fonts.add(f));
      faces.set(key, p);
    }
    p.then(() => continueRender(handle)).catch(cancelRender);
  }, [family, file, weight, handle]);
}

export type Glyph = {
  char: string;
  /** Full glyph outline, all contours. */
  d: string;
  /** Outer contours (a stem, the bowl of a P, the dot of an i). */
  outer: string[];
  /** Counters (the holes in O, P, A...). */
  holes: string[];
  /** Pen position and advance, in px. */
  x: number;
  advance: number;
  bbox: {x1: number; y1: number; x2: number; y2: number};
};

/**
 * Signed area of a subpath (shoelace over its on-curve and control points).
 * Only the sign matters: it tells outer contours from counters.
 */
const signedArea = (d: string) => {
  const n = d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map(Number) ?? [];
  let area = 0;
  for (let i = 0; i + 1 < n.length; i += 2) {
    const j = (i + 2) % (n.length - (n.length % 2));
    area += n[i] * n[j + 1] - n[j] * n[i + 1];
  }
  return area / 2;
};

/**
 * Lay out `text` as individual glyph outlines. Kerning from the font,
 * tracking in em (0.02 = +2% of the font size between letters).
 * `y` is the baseline. `align` positions the whole line around `x`.
 */
export function layoutGlyphs(
  font: Font,
  text: string,
  {x = 0, y = 0, size, tracking = 0, align = 'left'}: {
    x?: number;
    y?: number;
    size: number;
    tracking?: number;
    align?: 'left' | 'center' | 'right';
  },
): Glyph[] {
  const scale = size / font.unitsPerEm;
  // Direct cmap lookup, no GSUB: opentype.js 2.0 throws on some contextual
  // substitution tables (Inter's included), and display words don't need them.
  const glyphs = Array.from(text).map((c) => font.charToGlyph(c));
  const pens: number[] = [];
  let pen = 0;
  glyphs.forEach((g, i) => {
    pens.push(pen);
    const kern = i < glyphs.length - 1 ? font.getKerningValue(g, glyphs[i + 1]) : 0;
    pen += (g.advanceWidth ?? 0) * scale + kern * scale + (i < glyphs.length - 1 ? tracking * size : 0);
  });
  const offset = align === 'center' ? -pen / 2 : align === 'right' ? -pen : 0;

  return glyphs.map((g, i) => {
    const gx = x + offset + pens[i];
    const path = g.getPath(gx, y, size);
    // opentype.js 2.0 emits TrueType contours without Z (and `optimize` drops
    // the return-to-start segment): strokes would lose each contour's last
    // edge. Serialize unoptimized and close every ring explicitly.
    // (@types/opentype.js describes 1.x, where toPathData took decimals only.)
    const raw = (path as unknown as {toPathData(o: object): string}).toPathData({decimalPlaces: 2, optimize: false, flipY: false});
    const rings = raw ? getSubpaths(raw).map((r) => (/z\s*$/i.test(r) ? r : `${r}Z`)) : [];
    const d = rings.join('');
    const areas = rings.map(signedArea);
    const dominant = Math.sign(areas.reduce((m, a) => (Math.abs(a) > Math.abs(m) ? a : m), 0));
    const box = path.getBoundingBox();
    return {
      char: Array.from(text)[i] ?? '',
      d,
      outer: rings.filter((_, k) => Math.sign(areas[k]) === dominant),
      holes: rings.filter((_, k) => Math.sign(areas[k]) !== dominant),
      x: gx,
      advance: (g.advanceWidth ?? 0) * scale,
      bbox: {x1: box.x1, y1: box.y1, x2: box.x2, y2: box.y2},
    };
  });
}
