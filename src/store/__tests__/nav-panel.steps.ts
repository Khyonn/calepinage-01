import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { projectReducer, projectActions } from '@/store/projectSlice'
import { uiReducer } from '@/store/uiSlice'
import { selectCatalog, selectPoseParams, selectRooms } from '@/store/selectors'
import type { AppState, ProjectState } from '@/store/types'

const feature = await loadFeature('src/store/__tests__/nav-panel.feature', { language: 'fr' })

const ROOM_VERTICES = [
  { x: 0, y: 0 }, { x: 400, y: 0 },
  { x: 400, y: 300 }, { x: 0, y: 300 },
]

const initProjectState = (): ProjectState =>
  projectReducer(undefined, { type: '@@INIT' } as never)

const buildAppState = (ps: ProjectState): AppState => ({
  project: ps,
  ui: uiReducer(undefined, { type: '@@INIT' } as never),
})

describeFeature(feature, ({ Scenario }) => {

  Scenario('Modifier la cale de dilatation met à jour les paramètres de pose', ({ Given, When, Then }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    When('je règle la cale de dilatation à 1.2 cm', () => {
      const current = selectPoseParams(buildAppState(state))!
      state = projectReducer(state, projectActions.updatePoseParams({ ...current, cale: 1.2 }))
    })
    Then('la cale de dilatation vaut 1.2 cm', () => {
      expect(selectPoseParams(buildAppState(state))?.cale).toBe(1.2)
    })
  })

  Scenario('Ajouter un type de lame apparaît dans le catalogue', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    When('j\'ajoute un type de lame "Chêne 120cm" 120 × 14 cm', () => {
      state = projectReducer(state, projectActions.addPlankType({
        name: 'Chêne 120cm', length: 120, width: 14,
        description: '', pricing: { type: 'unit', pricePerUnit: 10 },
      }))
    })
    Then('le catalogue contient 1 type de lame', () => {
      expect(selectCatalog(buildAppState(state))).toHaveLength(1)
    })
    And('le premier type s\'appelle "Chêne 120cm"', () => {
      expect(selectCatalog(buildAppState(state))[0].name).toBe('Chêne 120cm')
    })
  })

  Scenario('Supprimer un type de lame utilisé est refusé', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    And('une pièce "Salon" de 400 cm de large dans le projet', () => {
      state = projectReducer(state, projectActions.addRoom({ name: 'Salon', vertices: ROOM_VERTICES }))
    })
    And('un type de lame "Chêne 120cm" 120 × 14 cm dans le catalogue', () => {
      state = projectReducer(state, projectActions.addPlankType({
        name: 'Chêne 120cm', length: 120, width: 14,
        description: '', pricing: { type: 'unit', pricePerUnit: 10 },
      }))
    })
    And('une rangée utilise ce type de lame dans "Salon"', () => {
      const roomId = selectRooms(buildAppState(state))[0].id
      const plankTypeId = selectCatalog(buildAppState(state))[0].id
      state = projectReducer(state, projectActions.addRow({
        roomId,
        row: { id: crypto.randomUUID(), roomId, plankTypeId, segments: [{ xOffset: 0 }] },
      }))
    })
    When('je tente de supprimer le type de lame', () => {
      const plankTypeId = selectCatalog(buildAppState(state))[0].id
      state = projectReducer(state, projectActions.deletePlankType({ id: plankTypeId }))
    })
    Then('le catalogue contient encore 1 type de lame', () => {
      expect(selectCatalog(buildAppState(state))).toHaveLength(1)
    })
  })

  Scenario('Éditer un type utilisé ne change pas ses dimensions', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    And('une pièce "Salon" de 400 cm de large dans le projet', () => {
      state = projectReducer(state, projectActions.addRoom({ name: 'Salon', vertices: ROOM_VERTICES }))
    })
    And('un type de lame "Chêne 120cm" 120 × 14 cm dans le catalogue', () => {
      state = projectReducer(state, projectActions.addPlankType({
        name: 'Chêne 120cm', length: 120, width: 14,
        description: '', pricing: { type: 'unit', pricePerUnit: 10 },
      }))
    })
    And('une rangée utilise ce type de lame dans "Salon"', () => {
      const roomId = selectRooms(buildAppState(state))[0].id
      const plankTypeId = selectCatalog(buildAppState(state))[0].id
      state = projectReducer(state, projectActions.addRow({
        roomId,
        row: { id: crypto.randomUUID(), roomId, plankTypeId, segments: [{ xOffset: 0 }] },
      }))
    })
    When('je modifie le type en passant la longueur à 240 cm et la largeur à 20 cm', () => {
      const existing = selectCatalog(buildAppState(state))[0]
      state = projectReducer(state, projectActions.updatePlankType({
        ...existing, length: 240, width: 20,
      }))
    })
    Then('la longueur du type reste 120 cm', () => {
      expect(selectCatalog(buildAppState(state))[0].length).toBe(120)
    })
    And('la largeur du type reste 14 cm', () => {
      expect(selectCatalog(buildAppState(state))[0].width).toBe(14)
    })
  })
})
