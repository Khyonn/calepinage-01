# Pattern : nouveau test BDD store

Pour tester un reducer, un sélecteur, un thunk ou une combinaison via le store. **Pas de JSDOM**, pas de mocks de service.

## Principe

Un test store = `état initial → action(s) → état attendu`. La fixture monte un mini-store en mémoire (pas `configureStore`, juste les reducers + un dispatch maison qui sait gérer les thunks).

## Workflow

1. **Créer le fichier `.feature`** dans `src/store/__tests__/<sujet>.feature`. Toujours `# language: fr` en première ligne.

2. **Générer le squelette steps** :
   ```bash
   bunx @amiceli/vitest-cucumber --feature src/store/__tests__/<sujet>.feature --spec src/store/__tests__/<sujet>.steps.ts --lang fr
   ```

3. **Implémenter les steps**. Réutiliser les helpers ci-dessous.

## Squelette feature

```gherkin
# language: fr
Fonctionnalité: <résumé court de ce qui est testé>

  Contexte:
    Étant donné un projet "<nom>" avec <setup minimal>

  Scénario: <comportement testé>
    Quand <action déclenchée>
    Alors <état observé>
    Et <invariant additionnel>
```

## Squelette steps

```ts
import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { projectReducer, projectActions } from '@/store/projectSlice'
import { uiReducer, uiActions } from '@/store/uiSlice'
import type { AppState, ProjectState, UIState, AppDispatch } from '@/store/types'
import type { UnknownAction } from '@reduxjs/toolkit'

const feature = await loadFeature('src/store/__tests__/<sujet>.feature', { language: 'fr' })

const initProject = (): ProjectState => projectReducer(undefined, { type: '@@INIT' } as never)
const initUI = (): UIState => uiReducer(undefined, { type: '@@INIT' } as never)
const buildAppState = (project: ProjectState, ui: UIState): AppState => ({ project, ui })

function makeFixture() {
  let project = initProject()
  let ui = initUI()
  const getState = (): AppState => buildAppState(project, ui)
  const dispatch: AppDispatch = ((action: UnknownAction | ((d: AppDispatch, g: () => AppState) => unknown)) => {
    if (typeof action === 'function') return action(dispatch, getState)
    if (action.type.startsWith('project/')) project = projectReducer(project, action)
    else if (action.type.startsWith('ui/')) ui = uiReducer(ui, action)
    return action
  }) as unknown as AppDispatch
  return { getState, dispatch }
}

describeFeature(feature, ({ Background, Scenario }) => {
  let fx: ReturnType<typeof makeFixture>

  Background(({ Given }) => {
    Given('<phrase exacte du Contexte>', () => {
      fx = makeFixture()
      fx.dispatch(projectActions.create({ name: 'Test' }))
      // setup spécifique
    })
  })

  Scenario('<phrase exacte du Scénario>', ({ When, Then, And }) => {
    When('<phrase exacte du Quand>', () => {
      fx.dispatch(/* action */)
    })
    Then('<phrase exacte du Alors>', () => {
      const state = fx.getState()
      expect(/* observation */).toBe(/* attendu */)
    })
  })
})
```

## Règles de rédaction Gherkin (FR)

- Mots-clés français : `Fonctionnalité`, `Contexte`, `Scénario`, `Étant donné`, `Quand`, `Alors`, `Et`, `Mais`.
- Phrases au présent, sujet implicite (`la pièce active`, `le projet`, `le sélecteur X`).
- Pas de variables techniques dans le Gherkin (`xOffset = 12.3`) sauf si la valeur est l'objet du test. Préférer formulations métier (« la première rangée consomme la chute »).
- Background = setup commun à tous les scénarios. Si un scénario a besoin d'un setup différent, ajouter `Étant donné` dans le scénario.

## Règles d'implémentation steps

- **Une assertion par `Then`/`And`**. Si plusieurs invariants → plusieurs `And`.
- **Pas de `setTimeout`, pas d'`await sleep`**. Les thunks sont synchrones (sauf I/O IDB qu'on ne teste pas ici).
- **Ne pas mocker** `crypto.randomUUID`, dates, etc. — laisser le runtime nodejs gérer. Si un ID est nécessaire pour assertion, le récupérer via sélecteur après l'action.
- **Réinitialiser fx dans Background**, jamais le partager entre scénarios.

## Quand utiliser ce pattern vs un test core

| Cas | Pattern |
|---|---|
| Logique pure (calcul, validation, géométrie) | `core/__tests__/*.feature` (utilise les fonctions directement, pas de store) |
| Reducer (action → state) | `store/__tests__/*.feature` (ce pattern) |
| Sélecteur dérivé | `store/__tests__/*.feature` (assertion via `selectXxx(state)`) |
| Thunk (orchestration de plusieurs actions) | `store/__tests__/*.feature` (ce pattern, dispatch du thunk) |
| Comportement UI (clic, render) | **Pas de test automatisé**. Décrire un test manuel dans la PR. |

## Exemple complet

Voir `src/store/__tests__/add-row.feature` + `add-row.steps.ts`. C'est le test de référence pour ce pattern.
