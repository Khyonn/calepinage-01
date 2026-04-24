import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { projectReducer, projectActions } from '@/store/projectSlice'
import { uiReducer, uiActions } from '@/store/uiSlice'
import { addRowThunk } from '@/store/addRowThunk'
import { selectActiveRoom, selectCatalog, selectRooms } from '@/store/selectors'
import type { AppState, ProjectState, UIState, AppDispatch } from '@/store/types'
import type { UnknownAction } from '@reduxjs/toolkit'
import type { Row } from '@/core/types'

const feature = await loadFeature('src/store/__tests__/segment-drag.feature', { language: 'fr' })

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
  return { ...fx, roomId, plankTypeId: pt.id }
}

describeFeature(feature, ({ Background, Scenario }) => {
  let fixture: ReturnType<typeof setupFixture>
  const s = () => fixture.getState()

  Background(({ Given }) => {
    Given('un projet "Test" avec une pièce "Salon" 400×300 cm et un type "Chêne" 120×12 cm sélectionnés', () => {
      fixture = setupFixture()
    })
  })

  Scenario('Dispatch sur segment 0 déclenche la cascade', ({ Given, When, Then, And }) => {
    let xOffset1Before: number
    let xOffset2Before: number

    Given('3 rangées du type "Chêne" générées automatiquement', () => {
      fixture.dispatch(addRowThunk())
      fixture.dispatch(addRowThunk())
      fixture.dispatch(addRowThunk())
      const rows = selectActiveRoom(s())!.rows
      xOffset1Before = rows[1].segments[0].xOffset
      xOffset2Before = rows[2].segments[0].xOffset
    })
    When('je dispatch updateSegmentOffset sur la rangée 0 segment 0 avec xOffset 42', () => {
      const row = selectActiveRoom(s())!.rows[0]
      fixture.dispatch(projectActions.updateSegmentOffset({
        roomId: fixture.roomId, rowId: row.id, segmentIndex: 0, xOffset: 42,
      }))
    })
    Then('le xOffset du segment 0 de la rangée 0 vaut 42', () => {
      expect(selectActiveRoom(s())!.rows[0].segments[0].xOffset).toBe(42)
    })
    And('les rangées 1 et 2 ont leur segment 0 ajusté à la cascade', () => {
      const rows = selectActiveRoom(s())!.rows
      expect(rows[1].segments[0].xOffset).not.toBe(xOffset1Before)
      expect(rows[2].segments[0].xOffset).not.toBe(xOffset2Before)
    })
  })

  Scenario('Dispatch sur segment > 0 ne déclenche pas la cascade', ({ Given, When, Then, And }) => {
    Given('3 rangées avec 2 segments chacune et xOffsets [[0, 0], [39.1, 0], [78.2, 0]]', () => {
      const offsets: [number, number][] = [[0, 0], [39.1, 0], [78.2, 0]]
      for (const [a, b] of offsets) {
        const row: Row = {
          id: crypto.randomUUID(),
          roomId: fixture.roomId,
          plankTypeId: fixture.plankTypeId,
          segments: [{ xOffset: a }, { xOffset: b }],
        }
        fixture.dispatch(projectActions.addRow({ roomId: fixture.roomId, row }))
      }
    })
    When('je dispatch updateSegmentOffset sur la rangée 0 segment 1 avec xOffset 77', () => {
      const row = selectActiveRoom(s())!.rows[0]
      fixture.dispatch(projectActions.updateSegmentOffset({
        roomId: fixture.roomId, rowId: row.id, segmentIndex: 1, xOffset: 77,
      }))
    })
    Then('le xOffset du segment 1 de la rangée 0 vaut 77', () => {
      expect(selectActiveRoom(s())!.rows[0].segments[1].xOffset).toBe(77)
    })
    And('les rangées 1 et 2 gardent leurs xOffsets initiaux', () => {
      const rows = selectActiveRoom(s())!.rows
      expect(rows[1].segments[0].xOffset).toBe(39.1)
      expect(rows[1].segments[1].xOffset).toBe(0)
      expect(rows[2].segments[0].xOffset).toBe(78.2)
      expect(rows[2].segments[1].xOffset).toBe(0)
    })
  })
})
