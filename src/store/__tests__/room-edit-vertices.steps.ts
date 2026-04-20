import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { projectReducer, projectActions } from '@/store/projectSlice'
import { uiReducer, uiActions } from '@/store/uiSlice'
import { selectActiveRoomHasRows, selectRooms } from '@/store/selectors'
import type { AppState, ProjectState, UIState } from '@/store/types'

const feature = await loadFeature('src/store/__tests__/room-edit-vertices.feature', { language: 'fr' })

const initProjectState = (): ProjectState =>
  projectReducer(undefined, { type: '@@INIT' } as never)
const initUIState = (): UIState =>
  uiReducer(undefined, { type: '@@INIT' } as never)
const buildAppState = (ps: ProjectState, ui: UIState): AppState => ({ project: ps, ui })

describeFeature(feature, ({ Scenario }) => {

  Scenario('Je déplace un sommet d\'une pièce sans rangées', ({ Given, When, Then, And }) => {
    let state = initProjectState()
    const roomId = 'room-1'

    Given('un projet avec une pièce "Salon" de 4 sommets [(0,0), (300,0), (300,200), (0,200)]', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
      state = projectReducer(state, projectActions.addRoom({
        id: roomId,
        name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 200 }, { x: 0, y: 200 }],
      }))
    })
    When('je dispatch updateRoom avec les nouveaux sommets [(0,0), (350,0), (350,200), (0,200)]', () => {
      state = projectReducer(state, projectActions.updateRoom({
        id: roomId,
        vertices: [{ x: 0, y: 0 }, { x: 350, y: 0 }, { x: 350, y: 200 }, { x: 0, y: 200 }],
      }))
    })
    Then('le sommet 1 a pour coordonnées (350, 0)', () => {
      const room = selectRooms(buildAppState(state, initUIState()))[0]
      expect(room.vertices[1]).toEqual({ x: 350, y: 0 })
    })
    And('le sommet 2 a pour coordonnées (350, 200)', () => {
      const room = selectRooms(buildAppState(state, initUIState()))[0]
      expect(room.vertices[2]).toEqual({ x: 350, y: 200 })
    })
  })

  Scenario('Push mur Shift décale 3 sommets du même delta', ({ Given, When, Then, And }) => {
    let state = initProjectState()
    const roomId = 'room-1'

    Given('un projet avec une pièce "Salon" de 4 sommets [(0,0), (300,0), (300,200), (0,200)]', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
      state = projectReducer(state, projectActions.addRoom({
        id: roomId,
        name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 200 }, { x: 0, y: 200 }],
      }))
    })
    When('je dispatch updateRoom avec les sommets modifiés par un delta (20, 0) sur l\'index 1 et ses voisins', () => {
      const room = selectRooms(buildAppState(state, initUIState()))[0]
      const idx = 1
      const n = room.vertices.length
      const dx = 20, dy = 0
      const next = room.vertices.map((v, i) => {
        if (i === idx || i === (idx - 1 + n) % n || i === (idx + 1) % n) {
          return { x: v.x + dx, y: v.y + dy }
        }
        return v
      })
      state = projectReducer(state, projectActions.updateRoom({ id: roomId, vertices: next }))
    })
    Then('le sommet 0 a pour coordonnées (20, 0)', () => {
      const room = selectRooms(buildAppState(state, initUIState()))[0]
      expect(room.vertices[0]).toEqual({ x: 20, y: 0 })
    })
    And('le sommet 1 a pour coordonnées (320, 0)', () => {
      const room = selectRooms(buildAppState(state, initUIState()))[0]
      expect(room.vertices[1]).toEqual({ x: 320, y: 0 })
    })
    And('le sommet 2 a pour coordonnées (320, 200)', () => {
      const room = selectRooms(buildAppState(state, initUIState()))[0]
      expect(room.vertices[2]).toEqual({ x: 320, y: 200 })
    })
    And('le sommet 3 a pour coordonnées (0, 200)', () => {
      const room = selectRooms(buildAppState(state, initUIState()))[0]
      expect(room.vertices[3]).toEqual({ x: 0, y: 200 })
    })
  })

  Scenario('Selector indique si la pièce active a des rangées', ({ Given, Then }) => {
    let state = initProjectState()
    let ui = initUIState()
    const roomId = 'room-1'

    Given('un projet avec une pièce "Salon" sans rangée active', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
      state = projectReducer(state, projectActions.addRoom({
        id: roomId,
        name: 'Salon',
        vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
      }))
      ui = uiReducer(ui, uiActions.setActiveRoom(roomId))
    })
    Then('selectActiveRoomHasRows retourne false', () => {
      expect(selectActiveRoomHasRows(buildAppState(state, ui))).toBe(false)
    })
  })
})
