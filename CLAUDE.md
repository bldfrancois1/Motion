# Motion Doctrine

Film motion design en cinq temps : **Position → Narratifs → Messages & preuves → PESO → Influence**.
Remotion pour le temps, SVG/React pour le dessin. Un seul fichier compte comme source de vérité créative : `DIRECTION.md`. Le contenu vient de `BRIEF.md`.

**Avant toute scène : lire `BRIEF.md` et `DIRECTION.md`. S'ils ne tranchent pas une question, la poser, ne pas l'inventer.**

## Kit : un outil par besoin

| Besoin | Outil | Où |
|---|---|---|
| Temps, rendu frame par frame | Remotion | `src/motion/timing.ts` (`sec`, `progress`, `stagger`) |
| Courbes maison | GSAP `CustomEase` + `Easing.bezier` | `src/motion/easing.ts` (`glide`, `travel`, `leave`) |
| Chorégraphie complexe (chevauchements, labels) | GSAP timeline pilotée par la frame | `useGsapTimeline` dans `easing.ts` |
| Forme fermée → forme fermée, 1 → N, N → 1 | flubber | `src/motion/morph.ts` |
| Ligne ouverte → ligne ouverte | `interpolatePath` (@remotion/paths) | `morphLine` dans `morph.ts` |
| Courbes, formes organiques, trajectoires | d3-shape | `src/motion/paths.ts` (`smoothPath`, `blob`) |
| Tracé progressif, déplacement le long d'un chemin | @remotion/paths | `drawSegment`, `drawIn`, `alongPath` |
| Irrégularité organique | simplex-noise + alea (graine) | `src/motion/noise.ts`, `wobble` dans `paths.ts` |
| Lettres comme géométrie | opentype.js | `src/typography/GlyphPath.tsx` (`useGlyphs`) |
| Texte vivant | CSS + FontFace | `DisplayText`, `MaskedText` |
| Caméra | matrice 2D | `src/motion/camera.tsx` (`CameraSvg`, `lerpCamera`) |
| Masques | CSS `clip-path` | `src/graphics/Mask.tsx` (`WipeMask`, `PathMask`) |
| Grain | `feTurbulence` graine = frame | `src/graphics/Grain.tsx` |

Si un besoin n'est pas dans ce tableau, le signaler avant d'ajouter une dépendance.

## Règles de rendu (non négociables)

1. **Tout dérive de `useCurrentFrame()`.** Pas de `setTimeout`, `requestAnimationFrame`, `Date.now()`, `Math.random()`, CSS `transition`/`animation`.
2. **GSAP n'a jamais sa propre horloge.** Uniquement via `useGsapTimeline` : timeline en pause, qui anime un objet JS simple, positionnée par `seek(frame / fps)`. GSAP ne cible jamais un nœud DOM.
3. **Pas de DrawSVG, MorphSVG ni MotionPath.** Ces plugins écrivent directement dans le DOM et entrent en conflit avec React à chaque frame. Leurs équivalents purs sont dans `paths.ts` et `morph.ts`.
4. **Aléatoire = bruit avec graine.** `noise(seed)`, `drift(seed, frame)`, `wobble(d, {seed})`, ou `random(seed)` de Remotion.
5. **Les interpolateurs flubber se construisent une fois** (`useMemo` ou portée module), jamais dans le rendu d'une frame.
6. **Les polices passent par `useGlyphFont` / `useFontFace`** : elles bloquent le rendu jusqu'au chargement. Aucune frame en police de secours.
7. **Durées en secondes via `sec()`**, jamais en frames codées en dur hors de `timing.ts`.

## Règles de direction

- **Remocn** (`src/vendor/remocn`) : utilise les composants Remocn comme références techniques, jamais comme templates graphiques. Réécris leurs valeurs, timings et compositions afin qu'aucun élément ne ressemble à une démo Remocn. Ces fichiers ne sont jamais importés.
- **Irrégularité : 1 à 3 %** de la taille de la forme. La typographie ne tremble pas au repos ; l'irrégularité apparaît quand une forme devient organique.
- **Plusieurs formes qui deviennent une seule : `convergeShapes`** (les contours glissent et se superposent). `assembleShapes` (découpe en triangles) seulement pour des pièces qui composent littéralement un tout, par exemple les quatre zones PESO. Sinon, on obtient des éclats façon PowerPoint.
- **Pas de flèches, pas de particules, pas de connecteurs cercle-à-cercle.** Un lien est une trajectoire (`Flow`), une continuité de matière.
- **Transitions = continuité de forme.** La forme qui sort d'une scène est celle qui entre dans la suivante. Pas de volets génériques entre scènes.
- **`public/svg/`** : de la matière à découper, masquer, transformer, morpher. Jamais un fond décoratif.
- **Pas de WebGL** (Three.js, React Three Fiber, shaders) et pas d'autre bibliothèque d'animation (Motion, Anime.js, Onda, Lottie) sans décision explicite dans `DIRECTION.md`.

## Boucle de travail

```bash
npm run dev                                                    # Studio : scrubber, une composition par scène
npx remotion still Scene-Position out/f.png --frame=120        # une frame, rapide
npm run typecheck
npm run check:determinism -- Scene-Position 0-179              # rendu séquentiel vs parallèle, doit être identique
npm run render                                                 # out/doctrine.mp4 (H.264, CRF 16, Rec.709)
```

- Chaque scène a sa composition `Scene-<Nom>` : itérer là, pas sur le film entier.
- **Regarder les frames rendues** avant de conclure : début, milieu de chaque transformation, fin. Un code qui compile ne prouve rien sur le mouvement.
- Une nouvelle scène s'ajoute à `SCENES` dans `src/compositions/Doctrine.tsx`.
- En environnement cloud sans Chrome Remotion : ajouter `--browser-executable=<chemin vers headless_shell>`.

## Pièges connus (déjà gérés, ne pas « corriger »)

- **opentype.js 2.0** n'émet pas de `Z` sur les contours TrueType, et `optimize` supprime le retour au point de départ. `layoutGlyphs` sérialise sans optimisation et referme chaque contour.
- **opentype.js 2.0** plante sur certaines tables GSUB contextuelles (dont celles d'Inter). `layoutGlyphs` passe directement par la cmap (`charToGlyph`), sans ligatures, ce qui ne gêne pas pour des mots en capitales.
- **`@types/opentype.js`** décrit la 1.x : la signature réelle de `toPathData` (objet d'options) est castée localement.
- **`GlyphPath` / `useGlyphs`** renvoient `[]` tant que la police charge. Le rendu est bloqué pendant ce temps, mais le code doit tolérer le tableau vide.

## Structure

```
src/
  compositions/Doctrine.tsx   ordre des scènes (SCENES)
  scenes/                     une scène = un fichier, durée exportée
  motion/                     temps, courbes, géométrie, morph, bruit, caméra
  graphics/                   Grain, Shape, Flow, Mask
  typography/                 fonts (chargement + layout), GlyphPath, DisplayText, MaskedText
  vendor/remocn/              références en lecture seule (MIT)
  theme.ts                    palette et polices : seule source des couleurs
public/
  fonts/  svg/  logo/  references/
```

## Licences

- **Remotion n'est pas MIT.** Gratuit pour les particuliers, les structures de 3 salariés maximum et les associations. Au-delà, une **Company License** est obligatoire (`node_modules/remotion/LICENSE.md`, remotion.pro).
- GSAP : licence standard gratuite, usage commercial inclus. flubber, d3-shape, opentype.js, simplex-noise, alea, Remocn : MIT/ISC. Inter : OFL.
