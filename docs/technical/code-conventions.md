# Conventions de code

## Taille des fichiers

Maximum **~150 lignes** par fichier. Quand un fichier approche la limite, c'est un signal pour extraire une sous-responsabilité dans un module dédié.

## Ordre des imports

Trois groupes séparés par une ligne vide, chacun trié alphabétiquement :

```typescript
// 1. node_modules
import { useState } from 'react'

// 2. alias de chemin (@/ → src/)
import { fillRow } from '@/core/rowFill'
import type { PoseParams } from '@/core/types'

// 3. chemins relatifs
import { RowDragHandle } from './RowDragHandle'
```

## TypeScript strict

- Pas de `any`
- Unions discriminées narrowées explicitement
- Types importés avec `import type` quand aucune valeur runtime n'est utilisée

## CSS custom properties

Toutes les couleurs sont exprimées via des variables CSS définies dans `index.css`. **Jamais de valeur hexadécimale en dur dans un composant.** Le thème sombre est géré via `@media (prefers-color-scheme: dark)` en surchargeant les mêmes variables.

Variables utilisées dans le canvas SVG :

```css
--accent:      #7c3aed                   /* éléments interactifs, drag actif         */
--error:       #dc2626                   /* lame trop courte, chute perdue (contour) */
--error-bg:    rgba(220, 38, 38, 0.35)   /* lame trop courte (fond semi-transparent) */
--warning:     #d97706                   /* violation de contrainte esthétique        */
--warning-bg:  rgba(217, 119, 6, 0.35)   /* fond d'alerte modéré                     */
--border:      #e5e7eb                   /* contour normal des lames                 */
--bg-surface:  #ffffff                   /* fond normal des lames                    */
--accent-bg:   rgba(124, 58, 237, 0.08)  /* fond de remplissage des pièces           */
```
