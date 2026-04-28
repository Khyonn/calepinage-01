# Pattern : nouveau test BDD core

Pour tester de la logique métier pure (calculs, validations, géométrie). Pas de store, pas de React, pas d'IDB.

## Quand utiliser

| Cas | Pattern |
|---|---|
| Fonction pure dans `src/core/` | **Ce pattern** (test core) |
| Reducer / sélecteur / thunk | `.agent/patterns/new-store-test.md` |
| Comportement UI | Pas de test automatisé |

## Workflow

1. **Créer le fichier `.feature`** dans `src/core/__tests__/<sujet>.feature`. Toujours `# language: fr` en première ligne.

2. **Générer le squelette steps** :
   ```bash
   bunx @amiceli/vitest-cucumber --feature src/core/__tests__/<sujet>.feature --spec src/core/__tests__/<sujet>.steps.ts --lang fr
   ```

3. **Implémenter les steps**. Importer **uniquement** depuis `@/core/`.

## Squelette feature

```gherkin
# language: fr
Fonctionnalité: <résumé court de la logique testée>

  Scénario: <comportement testé>
    Étant donné <input(s) de la fonction>
    Quand j'appelle <nom de la fonction>
    Alors je reçois <résultat attendu>
    Et <invariant additionnel>
```

## Squelette steps

```ts
import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { fonctionTestée } from '@/core/<module>'
import type { TypeMétier } from '@/core/types'

const feature = await loadFeature('src/core/__tests__/<sujet>.feature', { language: 'fr' })

describeFeature(feature, ({ Scenario }) => {
  let input: TypeMétier
  let result: ReturnType<typeof fonctionTestée>

  Scenario('<phrase exacte du Scénario>', ({ Given, When, Then, And }) => {
    Given('<phrase exacte de l\'étant donné>', () => {
      input = { /* ... */ }
    })
    When('<phrase exacte du Quand>', () => {
      result = fonctionTestée(input)
    })
    Then('<phrase exacte du Alors>', () => {
      expect(result).toEqual(/* attendu */)
    })
    And('<invariant>', () => {
      expect(/* observation */).toBe(/* attendu */)
    })
  })
})
```

## Règles d'implémentation

- **Imports limités à `@/core/`**. Aucun import `@/store/`, `@/persistence/`, `@/components/`, `@/hooks/`, `react`, `idb`.
- **Pas de mock**. Les fonctions core sont pures, donc testables avec des inputs littéraux.
- **Réutiliser les helpers existants** : `makeRectRoom`, `makePlankType`, etc. — s'inspirer de `src/core/__tests__/propagate-offcuts.steps.ts` pour les helpers de fixtures.
- **Une assertion par `Then`/`And`**.
- **Pas de boucle for cachée dans un step**. Si plusieurs cas similaires, utiliser un Scenario Outline (`Plan du scénario` en français) ou plusieurs scénarios distincts.

## Helpers communs (à dupliquer si besoin)

```ts
function makePlankType(id: string, name: string, length: number, width: number): PlankType {
  return {
    id, projectId: 'proj', name,
    length, width,
    pricing: { type: 'unit', pricePerUnit: 0 },
    description: '',
  }
}

function makeRectRoom(width: number, height: number, yOffset = 0): Room {
  return {
    id: 'room-1', projectId: 'proj', name: 'Rect',
    vertices: [
      { x: 0, y: 0 }, { x: width, y: 0 },
      { x: width, y: height }, { x: 0, y: height },
    ],
    yOffset,
    rows: [],
  }
}

const DEFAULT_POSE_PARAMS: PoseParams = {
  cale: 0.5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15,
}
```

Si plusieurs feature files utilisent les mêmes helpers, **ne pas les externaliser** dans un module partagé : la duplication est plus lisible que l'abstraction prématurée. Refactorer uniquement quand 3+ tests utilisent le même helper avec la même signature.

## Gotcha langue française

`loadFeature` ignore le commentaire `# language: fr` dans le fichier `.feature`. **Toujours** passer `{ language: 'fr' }` :

```ts
const feature = await loadFeature('src/core/__tests__/<sujet>.feature', { language: 'fr' })
```

Sans ça, les mots-clés `Étant donné`, `Contexte`, `Plan du scénario` ne sont pas reconnus et la suite crash.

## Exemple de référence

`src/core/__tests__/propagate-offcuts.feature` + `propagate-offcuts.steps.ts` — montre :
- `Background` partagé entre scénarios
- helpers locaux
- assertions `toBeCloseTo` pour les flottants
- import de plusieurs fonctions core dans le même fichier
