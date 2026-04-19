import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { projectReducer, projectActions } from '@/store/projectSlice'
import { uiReducer } from '@/store/uiSlice'
import { selectBackgroundPlan, selectBackgroundPlanScale, selectCurrentProject } from '@/store/selectors'
import type { AppState, ProjectState } from '@/store/types'

const feature = await loadFeature('src/store/__tests__/background-plan.feature', { language: 'fr' })

const initProjectState = (): ProjectState =>
  projectReducer(undefined, { type: '@@INIT' } as never)

const buildAppState = (ps: ProjectState): AppState => ({
  project: ps,
  ui: uiReducer(undefined, { type: '@@INIT' } as never),
})

const makeFile = (name: string): File =>
  new File([new Uint8Array([0])], name, { type: 'image/png' })

const importPlan = (state: ProjectState, name: string): ProjectState => {
  const project = selectCurrentProject(buildAppState(state))!
  return projectReducer(state, projectActions.setPlan({
    id: 'plan-1',
    projectId: project.id,
    imageFile: makeFile(name),
    opacity: 0.6,
    rotation: 0,
    x: 0,
    y: 0,
  }))
}

describeFeature(feature, ({ Scenario }) => {

  Scenario('Import d\'un plan attache une image au projet', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    When('j\'importe un plan de fond avec une image "plan.png"', () => {
      state = importPlan(state, 'plan.png')
    })
    Then('le plan de fond existe', () => {
      expect(selectBackgroundPlan(buildAppState(state))).not.toBeNull()
    })
    And('le nom de fichier du plan vaut "plan.png"', () => {
      expect(selectBackgroundPlan(buildAppState(state))?.imageFile?.name).toBe('plan.png')
    })
    And('l\'opacité du plan vaut 0.6', () => {
      expect(selectBackgroundPlan(buildAppState(state))?.opacity).toBe(0.6)
    })
    And('la rotation du plan vaut 0', () => {
      expect(selectBackgroundPlan(buildAppState(state))?.rotation).toBe(0)
    })
  })

  Scenario('Modifier l\'opacité du plan', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    And('un plan de fond importé avec une image "plan.png"', () => {
      state = importPlan(state, 'plan.png')
    })
    When('je règle l\'opacité du plan à 0.3', () => {
      state = projectReducer(state, projectActions.updatePlan({ opacity: 0.3 }))
    })
    Then('l\'opacité du plan vaut 0.3', () => {
      expect(selectBackgroundPlan(buildAppState(state))?.opacity).toBe(0.3)
    })
  })

  Scenario('Modifier la rotation du plan', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    And('un plan de fond importé avec une image "plan.png"', () => {
      state = importPlan(state, 'plan.png')
    })
    When('je règle la rotation du plan à 90', () => {
      state = projectReducer(state, projectActions.updatePlan({ rotation: 90 }))
    })
    Then('la rotation du plan vaut 90', () => {
      expect(selectBackgroundPlan(buildAppState(state))?.rotation).toBe(90)
    })
  })

  Scenario('Repositionner le plan de fond', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    And('un plan de fond importé avec une image "plan.png"', () => {
      state = importPlan(state, 'plan.png')
    })
    When('je repositionne le plan à (50, 30)', () => {
      state = projectReducer(state, projectActions.updatePlan({ x: 50, y: 30 }))
    })
    Then('la position du plan vaut (50, 30)', () => {
      const p = selectBackgroundPlan(buildAppState(state))
      expect(p?.x).toBe(50)
      expect(p?.y).toBe(30)
    })
  })

  Scenario('Calibrer le plan change l\'échelle', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    And('un plan de fond importé avec une image "plan.png"', () => {
      state = importPlan(state, 'plan.png')
    })
    When('je calibre le plan avec les points (0, 0) et (100, 0) pour une distance de 200 cm', () => {
      state = projectReducer(state, projectActions.updatePlan({
        calibration: {
          point1: { x: 0, y: 0 },
          point2: { x: 100, y: 0 },
          realDistance: 200,
        },
      }))
    })
    Then('l\'échelle du plan vaut 2', () => {
      expect(selectBackgroundPlanScale(buildAppState(state))).toBe(2)
    })
  })

  Scenario('Supprimer le plan de fond', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Appartement"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Appartement' }))
    })
    And('un plan de fond importé avec une image "plan.png"', () => {
      state = importPlan(state, 'plan.png')
    })
    When('je supprime le plan de fond', () => {
      state = projectReducer(state, projectActions.removePlan())
    })
    Then('le plan de fond n\'existe pas', () => {
      expect(selectBackgroundPlan(buildAppState(state))).toBeNull()
    })
  })
})
