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

Toutes les couleurs sont exprimées via des variables CSS définies dans `index.css`. **Jamais de valeur hexadécimale en dur dans un composant.**

Le jeu complet de variables est défini dans [ui-specifications.md](../features/ui-specifications.md) — s'y référer pour les noms et valeurs à utiliser.

### Dark mode

Le thème est déterminé dans cet ordre de priorité :

1. Valeur dans `localStorage` (`"light"` ou `"dark"`)
2. Si absente ou invalide → mode `system` : on lit `prefers-color-scheme` sans poser d'attribut `data-theme`

Le CSS couvre les trois cas sans JS supplémentaire :

```css
/* tokens clairs — fallback garanti même sans attribut */
:root { --accent: ...; }

/* thème sombre forcé explicitement */
:root[data-theme=dark] { --accent: ...; }

/* thème sombre système — s'applique si aucun choix explicite n'est posé */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme=light]) { --accent: ...; }
}
```

`data-theme=light` est le seul cas qui résiste à la préférence système — il n'est posé que quand l'utilisateur choisit explicitement le mode clair.

## Accessibilité

L'objectif est d'être accessible autant que possible. Quelques règles concrètes :

**`sr-only` plutôt qu'`aria-label`**

Pour les boutons icône ou tout élément dont le libellé n'est pas visible à l'écran, préférer un `<span>` visuellement masqué plutôt qu'un `aria-label` :

```tsx
// ✅ préféré
<button type="button">
  <svg aria-hidden="true" />
  <span className="sr-only">Effacer la sélection</span>
</button>

// ❌ à éviter
<button type="button" aria-label="Effacer la sélection">
  <svg />
</button>
```

La classe `sr-only` est définie dans `index.css` :

```css
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
```

Cette convention s'applique à tous les composants UI, y compris ceux déjà créés.
