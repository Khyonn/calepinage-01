import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { projectReducer, projectActions } from '@/store/projectSlice'
import { uiReducer } from '@/store/uiSlice'
import {
  selectRooms, selectCatalog, selectPoseParams,
  selectViolations, selectSummary, selectOffcutLinks,
} from '@/store/selectors'
import type { AppState, ProjectState } from '@/store/types'

const feature = await loadFeature('src/store/__tests__/store-project.feature', { language: 'fr' })

// Pièce de 400 cm de large → available = 399 cm
// fillRow(0, ..., {length: 120}) → [120, 120, 120, 39]
//   - last = 39 cm : valide avec minPlankLength=30, invalide avec minPlankLength=40
//   - chute = 120 - 39 - 0.1 = 80.9 cm
//   - réutilisable si xOffset = 120 - 80.9 = 39.1 cm
// fillRow(3, ...) → [117, 120, 120, 42] — joint à 357, gap avec row1 (360) = 3 < 15 → violation
const ROOM_VERTICES = [
  { x: 0, y: 0 }, { x: 400, y: 0 },
  { x: 400, y: 300 }, { x: 0, y: 300 },
]

const PLANK_TYPE_PAYLOAD = {
  name: 'Chêne 120cm',
  length: 120,
  width: 12,
  description: '',
  pricing: { type: 'unit' as const, pricePerUnit: 10 },
}

const initProjectState = (): ProjectState =>
  projectReducer(undefined, { type: '@@INIT' } as never)

const buildAppState = (ps: ProjectState): AppState => ({
  project: ps,
  ui: uiReducer(undefined, { type: '@@INIT' } as never),
})

describeFeature(feature, ({ Scenario }) => {

  Scenario('Augmenter la longueur minimale invalide les rangées existantes', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    And('une pièce "Salon" de 400 cm de large dans le projet', () => {
      state = projectReducer(state, projectActions.addRoom({ name: 'Salon', vertices: ROOM_VERTICES }))
    })
    And('un type de lame "Chêne 120cm" de longueur 120 cm dans le catalogue', () => {
      state = projectReducer(state, projectActions.addPlankType(PLANK_TYPE_PAYLOAD))
    })
    And('une rangée avec un décalage de 0 cm dans la pièce "Salon"', () => {
      const roomId = selectRooms(buildAppState(state))[0].id
      const plankTypeId = selectCatalog(buildAppState(state))[0].id
      state = projectReducer(state, projectActions.addRow({ roomId, row: { id: crypto.randomUUID(), roomId, plankTypeId, segments: [{ xOffset: 0 }] } }))
    })
    And("aucune violation n'est détectée", () => {
      expect(selectViolations(buildAppState(state))).toHaveLength(0)
    })
    When('je mets à jour la longueur minimale de lame à 40 cm', () => {
      state = projectReducer(state, projectActions.updatePoseParams({
        ...selectPoseParams(buildAppState(state))!, minPlankLength: 40,
      }))
    })
    Then('1 violation est détectée', () => {
      expect(selectViolations(buildAppState(state))).toHaveLength(1)
    })
    And('la violation est de type "last-plank-too-short"', () => {
      expect(selectViolations(buildAppState(state))[0].type).toBe('last-plank-too-short')
    })
  })

  Scenario('Supprimer une rangée invalide efface ses violations', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    And('une pièce "Salon" de 400 cm de large dans le projet', () => {
      state = projectReducer(state, projectActions.addRoom({ name: 'Salon', vertices: ROOM_VERTICES }))
    })
    And('un type de lame "Chêne 120cm" de longueur 120 cm dans le catalogue', () => {
      state = projectReducer(state, projectActions.addPlankType(PLANK_TYPE_PAYLOAD))
    })
    And('une rangée avec un décalage de 0 cm dans la pièce "Salon"', () => {
      const roomId = selectRooms(buildAppState(state))[0].id
      const plankTypeId = selectCatalog(buildAppState(state))[0].id
      state = projectReducer(state, projectActions.addRow({ roomId, row: { id: crypto.randomUUID(), roomId, plankTypeId, segments: [{ xOffset: 0 }] } }))
    })
    And('la longueur minimale de lame est de 40 cm', () => {
      state = projectReducer(state, projectActions.updatePoseParams({
        ...selectPoseParams(buildAppState(state))!, minPlankLength: 40,
      }))
    })
    When('je supprime la rangée', () => {
      const room = selectRooms(buildAppState(state))[0]
      state = projectReducer(state, projectActions.deleteRow({ id: room.rows[0].id, roomId: room.id }))
    })
    Then("aucune violation n'est détectée", () => {
      expect(selectViolations(buildAppState(state))).toHaveLength(0)
    })
  })

  Scenario('Un décalage insuffisant entre deux rangées provoque une violation de joint', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    And('une pièce "Salon" de 400 cm de large dans le projet', () => {
      state = projectReducer(state, projectActions.addRoom({ name: 'Salon', vertices: ROOM_VERTICES }))
    })
    And('un type de lame "Chêne 120cm" de longueur 120 cm dans le catalogue', () => {
      state = projectReducer(state, projectActions.addPlankType(PLANK_TYPE_PAYLOAD))
    })
    And('une rangée avec un décalage de 0 cm dans la pièce "Salon"', () => {
      const roomId = selectRooms(buildAppState(state))[0].id
      const plankTypeId = selectCatalog(buildAppState(state))[0].id
      state = projectReducer(state, projectActions.addRow({ roomId, row: { id: crypto.randomUUID(), roomId, plankTypeId, segments: [{ xOffset: 0 }] } }))
    })
    When("j'ajoute une rangée avec un décalage de 3 cm dans la pièce \"Salon\"", () => {
      const roomId = selectRooms(buildAppState(state))[0].id
      const plankTypeId = selectCatalog(buildAppState(state))[0].id
      state = projectReducer(state, projectActions.addRow({ roomId, row: { id: crypto.randomUUID(), roomId, plankTypeId, segments: [{ xOffset: 3 }] } }))
    })
    Then('1 violation est détectée', () => {
      expect(selectViolations(buildAppState(state))).toHaveLength(1)
    })
    And('la violation est de type "row-gap-too-small"', () => {
      expect(selectViolations(buildAppState(state))[0].type).toBe('row-gap-too-small')
    })
  })

  Scenario("La réutilisation d'une chute réduit le nombre de lames commandées", ({ Given, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    And('une pièce "Salon" de 400 cm de large dans le projet', () => {
      state = projectReducer(state, projectActions.addRoom({ name: 'Salon', vertices: ROOM_VERTICES }))
    })
    And('un type de lame "Chêne 120cm" de longueur 120 cm dans le catalogue', () => {
      state = projectReducer(state, projectActions.addPlankType(PLANK_TYPE_PAYLOAD))
    })
    And('une rangée avec un décalage de 0 cm dans la pièce "Salon"', () => {
      const roomId = selectRooms(buildAppState(state))[0].id
      const plankTypeId = selectCatalog(buildAppState(state))[0].id
      state = projectReducer(state, projectActions.addRow({ roomId, row: { id: crypto.randomUUID(), roomId, plankTypeId, segments: [{ xOffset: 0 }] } }))
    })
    And('une rangée avec un décalage de 39.1 cm dans la pièce "Salon"', () => {
      const roomId = selectRooms(buildAppState(state))[0].id
      const plankTypeId = selectCatalog(buildAppState(state))[0].id
      state = projectReducer(state, projectActions.addRow({ roomId, row: { id: crypto.randomUUID(), roomId, plankTypeId, segments: [{ xOffset: 39.1 }] } }))
    })
    Then('le résumé indique 7 lames à commander pour "Chêne 120cm"', () => {
      const plankTypeId = selectCatalog(buildAppState(state))[0].id
      const entry = selectSummary(buildAppState(state))!.byType.find(b => b.plankTypeId === plankTypeId)
      expect(entry!.planksNeeded).toBe(7)
    })
    And('un lien de réutilisation de chute est établi', () => {
      const rows = selectRooms(buildAppState(state))[0].rows
      const links = selectOffcutLinks(buildAppState(state))
      expect(links).toHaveLength(1)
      expect(links[0].sourceRowId).toBe(rows[0].id)
      expect(links[0].targetRowId).toBe(rows[1].id)
    })
  })

  Scenario('Sans réutilisation, chaque rangée consomme ses propres lames', ({ Given, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    And('une pièce "Salon" de 400 cm de large dans le projet', () => {
      state = projectReducer(state, projectActions.addRoom({ name: 'Salon', vertices: ROOM_VERTICES }))
    })
    And('un type de lame "Chêne 120cm" de longueur 120 cm dans le catalogue', () => {
      state = projectReducer(state, projectActions.addPlankType(PLANK_TYPE_PAYLOAD))
    })
    And('une rangée avec un décalage de 0 cm dans la pièce "Salon"', () => {
      const roomId = selectRooms(buildAppState(state))[0].id
      const plankTypeId = selectCatalog(buildAppState(state))[0].id
      state = projectReducer(state, projectActions.addRow({ roomId, row: { id: crypto.randomUUID(), roomId, plankTypeId, segments: [{ xOffset: 0 }] } }))
    })
    And('une rangée avec un décalage de 80 cm dans la pièce "Salon"', () => {
      const roomId = selectRooms(buildAppState(state))[0].id
      const plankTypeId = selectCatalog(buildAppState(state))[0].id
      state = projectReducer(state, projectActions.addRow({ roomId, row: { id: crypto.randomUUID(), roomId, plankTypeId, segments: [{ xOffset: 80 }] } }))
    })
    Then('le résumé indique 8 lames à commander pour "Chêne 120cm"', () => {
      const plankTypeId = selectCatalog(buildAppState(state))[0].id
      const entry = selectSummary(buildAppState(state))!.byType.find(b => b.plankTypeId === plankTypeId)
      expect(entry!.planksNeeded).toBe(8)
    })
    And("aucun lien de réutilisation de chute n'est établi", () => {
      expect(selectOffcutLinks(buildAppState(state))).toHaveLength(0)
    })
  })

})
