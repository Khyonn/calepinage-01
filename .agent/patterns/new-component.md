# Pattern : nouveau composant React

Composant **découplé du store par défaut**. Props in / callbacks out. Le couplage Redux est concentré dans des composants « orchestrateurs » dédiés.

## Règle de découplage

> Un composant ne consomme `useAppSelector` ou `useAppDispatch` que s'il **doit absolument** observer ou modifier le state Redux pour son rôle.

Si un composant a > 3 hooks Redux, c'est un signal d'orchestrateur — il doit être splitté en :
- **Composant pur** : reçoit ses données via props, émet des intentions via callbacks.
- **Composant orchestrateur** (ou hook) : lit le store, dispatch les actions, passe les props au composant pur.

## Structure dossier

```
MonComposant/
├── index.tsx                ← export du composant React
├── MonComposant.module.css  ← styles scoped (custom properties uniquement)
└── useMonComposant.ts       ← hook propre (si logique non triviale)
```

Hook partagé entre plusieurs composants → `src/hooks/`.

## Squelette : composant pur (cas standard)

```tsx
import styles from './MonComposant.module.css'

interface Props {
  // Données affichées (toujours en lecture seule)
  label: string
  value: number
  disabled?: boolean
  // Callbacks (verbe à l'impératif)
  onChange: (next: number) => void
  onCommit?: () => void
}

export function MonComposant({ label, value, disabled, onChange, onCommit }: Props) {
  return (
    <div className={styles.root}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.input}
        type="number"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={onCommit}
      />
    </div>
  )
}
```

## Squelette : composant orchestrateur

Quand le composant doit lire/écrire le store, isole l'accès dans un orchestrateur fin :

```tsx
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectFooBar } from '@/store/selectors'
import { projectActions } from '@/store/projectSlice'
import { MonComposant } from './MonComposant'

interface Props {
  itemId: string
}

export function MonComposantConnected({ itemId }: Props) {
  const dispatch = useAppDispatch()
  const data = useAppSelector((s) => selectFooBar(s, itemId))

  return (
    <MonComposant
      label={data.label}
      value={data.value}
      onChange={(next) => dispatch(projectActions.updateFoo({ id: itemId, value: next }))}
    />
  )
}
```

Le composant pur reste testable mentalement et portable (changement de framework, storybook futur, etc.). L'orchestrateur peut tomber à 2-3 hooks.

## CSS module

```css
.root {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2);
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.input {
  font: inherit;
  padding: var(--space-1) var(--space-2);
  background: var(--color-surface-input);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
```

**Aucune valeur hexadécimale, rgb(), em/px arbitraire.** Toujours `var(--token-...)`. Si un token manque, l'ajouter dans `src/index.css`.

## Hook propre (`useMonComposant.ts`)

Quand la logique du composant dépasse 30 lignes : extraire dans un hook co-localisé.

```ts
import { useState, useCallback } from 'react'

interface Args {
  initial: number
  onCommit: (n: number) => void
}

export function useMonComposant({ initial, onCommit }: Args) {
  const [draft, setDraft] = useState(initial)

  const handleChange = useCallback((n: number) => setDraft(n), [])
  const handleCommit = useCallback(() => onCommit(draft), [draft, onCommit])

  return { draft, handleChange, handleCommit }
}
```

## Règles dures

- **Pas d'import depuis `@/persistence/`**. Si une donnée vient d'IDB, elle passe par le store via un thunk.
- **Pas de `document.*` / `window.*` direct**, sauf hook d'intégration (drag, viewport, raccourcis clavier).
- **Pas de `setTimeout` / `setInterval`** sans cleanup `useEffect` explicite.
- **Pas de `<div onClick>`** pour des boutons. Utiliser `<button>` ou la primitive `Button` existante.
- **Limite props : 8** par composant. Au-delà → splitter.
- **Limite Redux hooks : 3** par composant. Au-delà → composant orchestrateur dédié.

## Migration drag → @use-gesture/vanilla

Pour tout drag de handle SVG (sommet, segment, plan, etc.) :

```ts
import { Gesture } from '@use-gesture/vanilla'
import { useEffect, useRef, useState } from 'react'

export function useDragHandle({ onCommit }: { onCommit: (delta: { dx: number; dy: number }) => void }) {
  const ref = useRef<SVGElement>(null)
  const [draft, setDraft] = useState<{ dx: number; dy: number } | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const gesture = new Gesture(ref.current, {
      onDrag: ({ first, last, movement: [dx, dy] }) => {
        if (first) setDraft({ dx: 0, dy: 0 })
        else if (last) {
          onCommit({ dx, dy })       // dispatch unique au release
          setDraft(null)
        } else setDraft({ dx, dy })   // preview locale uniquement
      },
    })
    return () => gesture.destroy()
  }, [onCommit])

  return { ref, draft }
}
```

**Aucun dispatch Redux dans `onDrag` hors `last: true`.** Sinon historique d'undo pollué.
