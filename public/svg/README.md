# Matière SVG

5 ou 6 SVG générés avec Haikei (haikei.app) ou fffuel (fffuel.co), puis nettoyés : un seul `<path>` par forme si possible, pas de `<defs>`, de filtres ni de dégradés.

Nommage : `organic-01.svg`, `ribbon-01.svg`, `wave-01.svg`, `texture-01.svg`...

Ils servent de matière à découper (`PathMask`), transformer (`morphShape`, `wobble`) ou morpher. **Jamais comme fond décoratif.** Pour charger un SVG dans une scène, extraire l'attribut `d` du tracé et l'importer comme chaîne dans `src/graphics/`.
