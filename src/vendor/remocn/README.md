# Remocn — références techniques (lecture seule)

Source : https://github.com/Remocn/remocn (commit `3903a46`), licence MIT (voir `LICENSE`).

| Fichier | Ce qu'on en retient | Ce qu'on jette |
|---|---|---|
| `tracking-in.tsx` | Tracking qui se resserre + flou qui se dissipe, piloté par la frame | Fond blanc codé en dur, Geist, spring (rebond), amplitude 0.5em |
| `mask-reveal-up.tsx` | Entrée/sortie décalées par ligne, deux courbes distinctes (entrée/sortie) | Ce n'est **pas** un masque : aucun clip, juste opacité + translation + flou |
| `push-through.tsx` | Structure d'une `TransitionPresentation` pour `@remotion/transitions` | Zoom x2.4 + flou 14px : trop démonstratif pour ce film |

Règles :

- Ces fichiers ne sont **jamais importés** par `src/scenes` ou `src/compositions`.
- Nos versions réécrites vivent dans `src/typography` (`DisplayText`, `MaskedText`) et `src/graphics`.
- `masked-slide-reveal` n'existe pas dans le registre Remocn ; l'équivalent le plus proche est `mask-reveal-up`, et il n'est pas masqué.
