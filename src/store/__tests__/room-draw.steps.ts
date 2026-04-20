import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { projectReducer, projectActions } from '@/store/projectSlice'
import { uiReducer, uiActions } from '@/store/uiSlice'
import { selectRooms, selectActiveRoom } from '@/store/selectors'
import type { AppState, ProjectState, UIState } from '@/store/types'

const feature = await loadFeature('src/store/__tests__/room-draw.feature', { language: 'fr' })

const initProjectState = (): ProjectState =>
  projectReducer(undefined, { type: '@@INIT' } as never)
const initUIState = (): UIState =>
  uiReducer(undefined, { type: '@@INIT' } as never)
const buildAppState = (ps: ProjectState, ui: UIState): AppState => ({ project: ps, ui })

describeFeature(feature, ({ Scenario }) => {

  Scenario('Je dessine un rectangle et le nomme', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    When('je dispatch addRoom avec le nom "Salon" et les sommets [(0,0), (300,0), (300,200), (0,200)]', () => {
      state = projectReducer(state, projectActions.addRoom({
        name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 200 }, { x: 0, y: 200 }],
      }))
    })
    Then('le projet contient 1 pièce', () => {
      const rooms = selectRooms(buildAppState(state, initUIState()))
      expect(rooms).toHaveLength(1)
    })
    And('la pièce s\'appelle "Salon"', () => {
      const rooms = selectRooms(buildAppState(state, initUIState()))
      expect(rooms[0].name).toBe('Salon')
    })
    And('la pièce a 4 sommets', () => {
      const rooms = selectRooms(buildAppState(state, initUIState()))
      expect(rooms[0].vertices).toHaveLength(4)
    })
  })

  Scenario('Dessiner une pièce la rend active', ({ Given, When, Then, And }) => {
    let state = initProjectState()
    let ui = initUIState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    When('je dispatch addRoom avec l\'id "room-1" et le nom "Cuisine" et les sommets [(0,0), (200,0), (200,150), (0,150)]', () => {
      state = projectReducer(state, projectActions.addRoom({
        id: 'room-1',
        name: 'Cuisine',
        vertices: [{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 200, y: 150 }, { x: 0, y: 150 }],
      }))
    })
    And('je dispatch setActiveRoom avec "room-1"', () => {
      ui = uiReducer(ui, uiActions.setActiveRoom('room-1'))
    })
    Then('la pièce active a l\'id "room-1"', () => {
      const active = selectActiveRoom(buildAppState(state, ui))
      expect(active?.id).toBe('room-1')
    })
  })

  Scenario('Dessiner une deuxième pièce les ajoute toutes les deux', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    When('je dispatch addRoom avec le nom "Salon" et les sommets [(0,0), (300,0), (300,200), (0,200)]', () => {
      state = projectReducer(state, projectActions.addRoom({
        name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 200 }, { x: 0, y: 200 }],
      }))
    })
    And('je dispatch addRoom avec le nom "Cuisine" et les sommets [(400,0), (600,0), (600,200), (400,200)]', () => {
      state = projectReducer(state, projectActions.addRoom({
        name: 'Cuisine',
        vertices: [{ x: 400, y: 0 }, { x: 600, y: 0 }, { x: 600, y: 200 }, { x: 400, y: 200 }],
      }))
    })
    Then('le projet contient 2 pièces', () => {
      const rooms = selectRooms(buildAppState(state, initUIState()))
      expect(rooms).toHaveLength(2)
    })
  })
})
