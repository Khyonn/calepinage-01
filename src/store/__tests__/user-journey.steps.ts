import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { projectReducer, projectActions } from '@/store/projectSlice'
import { uiReducer, uiActions } from '@/store/uiSlice'
import {
  selectCurrentProject, selectProjectList,
  selectRooms, selectCatalog, selectPoseParams,
  selectActiveRoomId, selectActiveRoom,
  selectAllPlanks, selectViolations,
} from '@/store/selectors'
import type { AppState, ProjectState, UIState } from '@/store/types'

const feature = await loadFeature('src/store/__tests__/user-journey.feature', { language: 'fr' })

// Pièce de 400 cm de large → available = 399 cm
// fillRow(0, {length: 120}) → [120, 120, 120, 39] = 4 lames
// Avec minPlankLength=40 : last=39 < 40 → violation "last-plank-too-short"
const ROOM_VERTICES = [
  { x: 0, y: 0 }, { x: 400, y: 0 },
  { x: 400, y: 300 }, { x: 0, y: 300 },
]

const initProject = (): ProjectState => projectReducer(undefined, { type: '@@INIT' } as never)
const initUI = (): UIState => uiReducer(undefined, { type: '@@INIT' } as never)
const buildAppState = (project: ProjectState, ui: UIState): AppState => ({ project, ui })

describeFeature(feature, ({ Scenario }) => {

  Scenario('Créer, peupler et supprimer un projet', ({ When, Then, And }) => {
    let project = initProject()
    let ui = initUI()
    let rowId: string

    const s = () => buildAppState(project, ui)

    // ── Créer le projet ────────────────────────────────────────────────────────

    When('je crée un projet nommé "Appartement"', () => {
      project = projectReducer(project, projectActions.create({ name: 'Appartement' }))
    })
    Then('le projet courant s\'appelle "Appartement"', () => {
      expect(selectCurrentProject(s())?.name).toBe('Appartement')
    })
    And('la liste contient 1 projet', () => {
      expect(selectProjectList(s())).toHaveLength(1)
    })
    And("aucune pièce n'est active", () => {
      expect(selectActiveRoomId(s())).toBeNull()
    })

    // ── Ajouter une pièce ──────────────────────────────────────────────────────

    When('j\'ajoute une pièce "Salon" de 400 cm de large au projet', () => {
      project = projectReducer(project, projectActions.addRoom({ name: 'Salon', vertices: ROOM_VERTICES }))
    })
    Then('le projet courant contient 1 pièce', () => {
      expect(selectRooms(s())).toHaveLength(1)
    })
    And("la pièce n'est pas encore sélectionnée", () => {
      expect(selectActiveRoom(s())).toBeNull()
    })

    // ── Sélectionner la pièce ──────────────────────────────────────────────────

    When('je sélectionne la pièce "Salon"', () => {
      const roomId = selectRooms(s()).find(r => r.name === 'Salon')!.id
      ui = uiReducer(ui, uiActions.setActiveRoom(roomId))
    })
    Then('la pièce active est "Salon"', () => {
      expect(selectActiveRoom(s())?.name).toBe('Salon')
    })

    // ── Ajouter un type de lame ────────────────────────────────────────────────

    When('j\'ajoute un type de lame "Chêne 120cm" de longueur 120 cm au catalogue', () => {
      project = projectReducer(project, projectActions.addPlankType({
        name: 'Chêne 120cm', length: 120, width: 12, description: '',
        pricing: { type: 'unit', pricePerUnit: 10 },
      }))
    })
    Then('le catalogue contient 1 type de lame', () => {
      expect(selectCatalog(s())).toHaveLength(1)
    })

    // ── Ajouter une rangée ─────────────────────────────────────────────────────

    When('j\'ajoute une rangée avec un décalage de 0 cm dans la pièce "Salon"', () => {
      const roomId = selectActiveRoomId(s())!
      const plankTypeId = selectCatalog(s())[0].id
      project = projectReducer(project, projectActions.addRow({ roomId, row: { id: crypto.randomUUID(), roomId, plankTypeId, segments: [{ xOffset: 0 }] } }))
      rowId = selectActiveRoom(s())!.rows[0].id
    })
    Then('la pièce active contient 1 rangée', () => {
      expect(selectActiveRoom(s())?.rows).toHaveLength(1)
    })
    And('la rangée contient 4 lames calculées', () => {
      expect(selectAllPlanks(s()).get(rowId)).toHaveLength(4)
    })
    And('le calepinage ne présente aucune violation', () => {
      expect(selectViolations(s())).toHaveLength(0)
    })

    // ── Changer les paramètres de pose ─────────────────────────────────────────

    When('je mets à jour la longueur minimale de lame à 40 cm', () => {
      project = projectReducer(project, projectActions.updatePoseParams({
        ...selectPoseParams(s())!, minPlankLength: 40,
      }))
    })
    Then('la longueur minimale est à 40 cm', () => {
      expect(selectPoseParams(s())?.minPlankLength).toBe(40)
    })
    And('1 violation est détectée', () => {
      expect(selectViolations(s())).toHaveLength(1)
    })

    // ── Supprimer la rangée ────────────────────────────────────────────────────

    When('je supprime la rangée', () => {
      const roomId = selectActiveRoomId(s())!
      project = projectReducer(project, projectActions.deleteRow({ id: rowId, roomId }))
    })
    Then('la pièce active ne contient aucune rangée', () => {
      expect(selectActiveRoom(s())?.rows).toHaveLength(0)
    })
    And('la suppression de la rangée efface les violations', () => {
      expect(selectViolations(s())).toHaveLength(0)
    })

    // ── Supprimer la pièce ─────────────────────────────────────────────────────

    When('je supprime la pièce "Salon"', () => {
      const roomId = selectActiveRoomId(s())!
      project = projectReducer(project, projectActions.deleteRoom({ id: roomId }))
      ui = uiReducer(ui, uiActions.setActiveRoom(null))
    })
    Then('le projet ne contient aucune pièce', () => {
      expect(selectRooms(s())).toHaveLength(0)
    })
    And('la sélection de pièce est réinitialisée', () => {
      expect(selectActiveRoom(s())).toBeNull()
    })

    // ── Supprimer le projet ────────────────────────────────────────────────────

    When('je supprime le projet', () => {
      project = projectReducer(project, projectActions.delete({ id: selectCurrentProject(s())!.id }))
    })
    Then("il n'y a pas de projet courant", () => {
      expect(selectCurrentProject(s())).toBeNull()
    })
    And('la liste est vide', () => {
      expect(selectProjectList(s())).toHaveLength(0)
    })
  })

})
