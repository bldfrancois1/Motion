# Direction

Les décisions de mouvement et de forme. Quand ce fichier tranche, le code suit. Chaque valeur marquée *provisoire* doit être validée sur la vidéo de référence.

## Référence

- Vidéo de référence : `public/references/` (déposer le fichier ou le lien ici)
- Ce qu'on lui prend : départ rapide, glissement, freinage très doux, sans élasticité.
- Ce qu'on ne lui prend pas :

## Fil de matière

Le film est fait d'une seule matière graphique qui se transforme. Chaque scène hérite de la forme de la précédente.

| Scène | Forme en entrée | Transformation | Forme en sortie | Outil |
|---|---|---|---|---|
| Position | le mot POSITION (tracés des glyphes) | les contours convergent | une forme organique | `convergeShapes` |
| Narratifs | la forme | elle se sépare | N formes | `splitShape` |
| Messages & preuves | N formes | | | |
| PESO | | les pièces composent un territoire | 4 zones | `assembleShapes` |
| Influence | 4 zones | | | |

## Mouvement

| Décision | Valeur | Statut |
|---|---|---|
| Courbe signature | `glide` : `M0,0 C0.05,0.35 0.12,0.72 0.3,0.86 0.444,0.972 0.7,1 1,1` | provisoire |
| Rebond / élasticité | aucun | décidé |
| Durée d'une transformation majeure | 1,2 s | provisoire |
| Temps de lecture d'un mot seul | 1 s minimum | provisoire |
| Décalage entre éléments d'un groupe | 2 à 3 frames | provisoire |
| Caméra | poussée lente continue (+6 % par scène), jamais de secousse | provisoire |
| Irrégularité | 1 à 3 % de la taille de la forme, pendant les transformations et sur les formes organiques | décidé |
| Grain | opacité 0,06, renouvelé toutes les 2 frames | provisoire |

## Forme et couleur

| Décision | Valeur |
|---|---|
| Palette | à définir, puis reporter dans `src/theme.ts` |
| Police display | à définir. Inter est provisoire : déposer le TTF/OTF de la marque dans `public/fonts/` |
| Police texte | à définir |
| Épaisseur de trait | 2 px à 1080p |
| Fond | papier clair ou encre sombre : choisir |

## Ce qui ne bouge jamais

- 
