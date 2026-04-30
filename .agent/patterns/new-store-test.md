# Pattern : nouveau test BDD store (comportement utilisateur)

Pattern principal pour ce repo. ~90 % des tests passent par là.

## Philosophie

Un scénario BDD décrit un **comportement utilisateur observable**. La structure est rigide :

| Bloc Gherkin | Sens technique |
|---|---|
| `Étant donné` (Background ou Scénario) | **État initial du store** : mode actif, catalogue, pièces, rangées, sélection. Construit soit via `preloadedState`, soit via une suite de dispatchs de setup. |
| `Quand` | **Une action ou un thunk** dispatché. Représente l'intention que l'utilisateur exprime (drag-release, click, ouvrir panneau). Pas de simulation DOM, pas de hook React. |
| `Alors` / `Et` | **Sortie d'un sélecteur** appelé sur le state final. Représente ce que l'utilisateur voit. Lecture directe d'un champ interne du state autorisée mais découragée. |

Le composant React n'est pas testé : c'est la liaison framework du sélecteur (lecture) et du dispatcher (écriture). Si le store répond correctement, le composant aussi.

## Quand utiliser ce pattern vs core

| Cas | Pattern |
|---|---|
| Mode + catalogue + pièce → drag → tableau résumé | **Ce pattern (store)** |
| Sélection d'une rangée / dispatch d'une action UI / undo / redo | **Ce pattern (store)** |
| Sauvegarde / chargement / round-trip via thunks | **Ce pattern (store)** |
| Fonction mathématique pure réutilisée (`computeRowYStart`, `parseUrl`) | `.agent/patterns/new-bdd-test.md` (core) |
| Composant React | Pas de test automatisé |

> Si un test core devient nécessaire seulement parce qu'on extrait une fonction pour rendre le store testable, **garder le test au niveau store** et oublier l'extraction. Le test doit refléter le scénario utilisateur, pas la structure interne du code.

## Workflow

1. **Créer `.feature`** dans `src/store/__tests__/<sujet>.feature`. Toujours `# language: fr` en première ligne.

2. **Générer le squelette steps** :
   ```bash
   bunx @amiceli/vitest-cucumber --feature src/store/__tests__/<sujet>.feature --spec src/store/__tests__/<sujet>.steps.ts --lang fr
   ```

3. **Implémenter les steps** en suivant les fixtures ci-dessous.

## Squelette feature

```gherkin
# language: fr
Fonctionnalité: <comportement utilisateur testé>

  Contexte:
    Étant donné un projet "Salon" avec un type de lame "Chêne 120×20"
    Et une pièce rectangulaire "Salon" 400×300 cm
    Et une rangée 0 sur "Salon" en mode "main"

  Scénario: Drag du segment 1 de la rangée 0 met à jour le tableau résumé
    Quand l'utilisateur relâche un drag du segment 1 de la rangée 0 avec un offset de 12 cm
    Alors le sélecteur "selectSummaryRows" pour "Salon" renvoie une longueur consommée de <X> cm
    Et le segment 1 affiche un offset de 12 cm

  Scénario: Sans pièce active, ouvrir le drawer ne sélectionne rien
    Quand l'utilisateur ouvre le drawer sans pièce active
    Alors le sélecteur "selectActiveRoomId" renvoie null
```

Phrases au présent, sujet implicite (« l'utilisateur », « le sélecteur X »). Pas de `xOffset = 12.3` dans le Gherkin sauf si la valeur est l'objet du test.

## Squelette steps

```ts
import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { projectReducer, projectActions } from '@/store/projectSlice'
import { uiReducer, uiActions } from '@/store/uiSlice'
import { selectSummaryRows, selectActiveRoomId } from '@/store/selectors'
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
  let roomId: string

  Background(({ Given, And }) => {
    Given('un projet "Salon" avec un type de lame "Chêne 120×20"', () => {
      fx = makeFixture()
      fx.dispatch(projectActions.create({ name: 'Salon' }))
      fx.dispatch(projectActions.addPlankType({ name: 'Chêne 120×20', length: 120, width: 20 }))
    })
    And('une pièce rectangulaire "Salon" 400×300 cm', () => {
      fx.dispatch(projectActions.addRoom({ name: 'Salon', vertices: [
        { x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 },
      ] }))
      const state = fx.getState()
      roomId = state.project.current!.rooms[0].id
    })
    And('une rangée 0 sur "Salon" en mode "main"', () => {
      fx.dispatch(projectActions.addRow({ roomId }))
      fx.dispatch(uiActions.setMode('main'))
      fx.dispatch(uiActions.setActiveRoomId(roomId))
    })
  })

  Scenario('Drag du segment 1 de la rangée 0 met à jour le tableau résumé', ({ When, Then, And }) => {
    When('l\'utilisateur relâche un drag du segment 1 de la rangée 0 avec un offset de 12 cm', () => {
      fx.dispatch(projectActions.updateSegmentOffset({ roomId, rowIndex: 0, segmentIndex: 1, offset: 12 }))
    })
    Then('le sélecteur "selectSummaryRows" pour "Salon" renvoie une longueur consommée de <X> cm', () => {
      const rows = selectSummaryRows(fx.getState(), roomId)
      expect(rows[0].consumedLength).toBeCloseTo(/* attendu */, 2)
    })
    And('le segment 1 affiche un offset de 12 cm', () => {
      const room = fx.getState().project.current!.rooms.find((r) => r.id === roomId)!
      expect(room.rows[0].segments[1].offset).toBeCloseTo(12, 2)
    })
  })
})
```

## Règles dures

- **Pas de simulation DOM** (`fireEvent`, `userEvent`, JSDOM). Les actions sont dispatchées directement.
- **Pas de mock**. Les sélecteurs et reducers sont synchrones, déterministes.
- **Pas de `setTimeout` / `await sleep`**. Si un thunk est asynchrone (I/O), le sortir du test ou utiliser un mode synchrone testable.
- **Pas de `crypto.randomUUID` mocké**. Récupérer les IDs après dispatch via `fx.getState()`.
- **Réinitialiser fx dans Background**, jamais le partager entre scénarios.
- **Une assertion par `Then` / `And`**.
- **Sélecteurs via `selectXxx(state, ...args)`**, pas de lecture directe profonde quand un sélecteur existe. Si un sélecteur manque → l'écrire (c'est probablement le bug à fixer).

## Cas drag (preview locale + commit unique)

Le composant gère la preview locale ; le store ne reçoit qu'**une** action au release. Le test ne simule pas la preview, il dispatche directement l'action de commit :

```gherkin
Scénario: Une seule action updateSegmentOffset après plusieurs frames de preview
  Quand l'utilisateur relâche un drag du segment 1 de la rangée 0 avec un offset de 18 cm
  Alors le segment 1 a un offset de 18 cm
  Et l'historique d'undo contient une seule entrée
```

Si on a vraiment besoin de vérifier l'invariant « un seul commit », ajouter un middleware de capture d'actions dans la fixture et compter les actions `project/*` dispatchées pendant le `When`. Voir 16.5 pour l'exemple.

## Cas thunk

Un thunk est dispatché comme une action :

```ts
fx.dispatch(loadProject(projectId))
```

Le `dispatch` de la fixture appelle directement `action(dispatch, getState)` si `action` est une fonction. Pas besoin de middleware thunk.

## Helpers à ne pas externaliser prématurément

Si plusieurs `.feature` utilisent le même setup (catalogue + pièce rect), **dupliquer les dispatchs de Background** plutôt qu'extraire un helper. Refactorer uniquement quand 3+ fichiers répètent exactement la même séquence.

Cas légitime d'extraction : `makeTestStore({ preloadedProject })` pour tester `redux-undo` avec un état préchargé non-trivial (cf. 16.6).

## Gotcha langue française

`loadFeature` ignore le commentaire `# language: fr` dans le fichier `.feature`. **Toujours** passer `{ language: 'fr' }` :

```ts
const feature = await loadFeature('src/store/__tests__/<sujet>.feature', { language: 'fr' })
```

Sans ça, `Étant donné`, `Contexte`, `Plan du scénario` ne sont pas reconnus et la suite crash.

## Exemple de référence

`src/store/__tests__/add-row.feature` + `add-row.steps.ts` — montre Background partagé, dispatchs de setup, assertion via sélecteur, assertion sur invariant interne.
