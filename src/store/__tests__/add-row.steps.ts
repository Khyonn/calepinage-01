import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { projectReducer, projectActions } from '@/store/projectSlice'
import { uiReducer, uiActions } from '@/store/uiSlice'
import { addRowThunk } from '@/store/addRowThunk'
import { selectActiveRoom, selectCatalog, selectRooms } from '@/store/selectors'
import type { AppState, ProjectState, UIState, AppDispatch } from '@/store/types'
import type { UnknownAction } from '@reduxjs/toolkit'

const feature = await loadFeature('src/store/__tests__/add-row.feature', { language: 'fr' })

const ROOM_VERTICES = [
  { x: 0, y: 0 }, { x: 400, y: 0 },
  { x: 400, y: 300 }, { x: 0, y: 300 },
]

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

function setupFixture() {
  const fx = makeFixture()
  fx.dispatch(projectActions.create({ name: 'Test' }))
  fx.dispatch(projectActions.addRoom({ name: 'Salon', vertices: ROOM_VERTICES }))
  fx.dispatch(projectActions.addPlankType({
    name: 'Chêne', length: 120, width: 12, description: '',
    pricing: { type: 'unit', pricePerUnit: 0 },
  }))
  const roomId = selectRooms(fx.getState()).find(r => r.name === 'Salon')!.id
  fx.dispatch(uiActions.setActiveRoom(roomId))
  const pt = selectCatalog(fx.getState()).find(p => p.name === 'Chêne')!
  fx.dispatch(uiActions.setSelectedPlankTypeId(pt.id))
  return fx
}

describeFeature(feature, ({ Background, Scenario }) => {

  let fixture: ReturnType<typeof makeFixture>
  const s = () => fixture.getState()

  Background(({ Given }) => {
    Given('un projet "Test" avec une pièce "Salon" de 400×300 cm et un type de lame "Chêne" 120×12 cm sélectionnés', () => {
      fixture = setupFixture()
    })
  })

  Scenario('Ajouter une rangée à une pièce vide', ({ When, Then, And }) => {
    When('je déclenche le thunk addRow', () => {
      fixture.dispatch(addRowThunk())
    })
    Then('la pièce active contient 1 rangée', () => {
      expect(selectActiveRoom(s())?.rows).toHaveLength(1)
    })
    And('la première rangée référence le type "Chêne"', () => {
      const row = selectActiveRoom(s())!.rows[0]
      const pt = selectCatalog(s()).find(p => p.id === row.plankTypeId)
      expect(pt?.name).toBe('Chêne')
    })
    And('chaque segment de la rangée a un xOffset de 0', () => {
      const row = selectActiveRoom(s())!.rows[0]
      expect(row.segments.length).toBeGreaterThan(0)
      for (const seg of row.segments) expect(seg.xOffset).toBe(0)
    })
  })

  Scenario('Ajouter plusieurs rangées successives', ({ When, Then, And }) => {
    When('je déclenche le thunk addRow 3 fois', () => {
      fixture.dispatch(addRowThunk())
      fixture.dispatch(addRowThunk())
      fixture.dispatch(addRowThunk())
    })
    Then('la pièce active contient 3 rangées', () => {
      expect(selectActiveRoom(s())?.rows).toHaveLength(3)
    })
    And('toutes les rangées référencent le type "Chêne"', () => {
      const rows = selectActiveRoom(s())!.rows
      const pt = selectCatalog(s()).find(p => p.name === 'Chêne')!
      for (const r of rows) expect(r.plankTypeId).toBe(pt.id)
    })
  })

  Scenario('Ajouter une rangée consomme la chute de la rangée précédente', ({ When, Then }) => {
    When('je déclenche le thunk addRow 2 fois', () => {
      fixture.dispatch(addRowThunk())
      fixture.dispatch(addRowThunk())
    })
    Then('le xOffset du segment 0 de la rangée 2 consomme la chute de la rangée 1', () => {
      // Room 400×300, plank 120×12, cale=0.5, sawWidth=0.1.
      // Row 1 xOffset=0 → available=399, planks lengths: 120+120+120+39.
      // Offcut = 120 − 39 − 0.1 = 80.9 → row 2 xOffset = 120 − 80.9 = 39.1.
      const row2 = selectActiveRoom(s())!.rows[1]
      expect(row2.segments[0].xOffset).toBeCloseTo(39.1, 5)
    })
  })

})
