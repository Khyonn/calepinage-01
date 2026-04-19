import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { projectReducer, projectActions } from '@/store/projectSlice'
import type { Project, PoseParams } from '@/core/types'
import type { ProjectState } from '@/store/types'

const feature = await loadFeature('src/store/__tests__/project-manager.feature', { language: 'fr' })

const DEFAULT_POSE: PoseParams = { cale: 0.5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }

const initProjectState = (): ProjectState =>
  projectReducer(undefined, { type: '@@INIT' } as never)

const buildProject = (name: string): Project => ({
  id: crypto.randomUUID(),
  name,
  poseParams: DEFAULT_POSE,
  catalog: [],
  rooms: [],
})

describeFeature(feature, ({ Scenario }) => {

  Scenario("Créer un projet l'ajoute à la liste et le rend courant", ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('une application sans projet', () => {
      expect(state.list).toHaveLength(0)
      expect(state.current).toBeNull()
    })
    When('je crée un projet nommé "Maison"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Maison' }))
    })
    Then('la liste contient 1 projet', () => {
      expect(state.list).toHaveLength(1)
    })
    And('le projet courant est "Maison"', () => {
      expect(state.current?.name).toBe('Maison')
    })
  })

  Scenario('Supprimer le projet courant vide la liste et le projet courant', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Maison"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Maison' }))
    })
    When('je supprime le projet courant', () => {
      state = projectReducer(state, projectActions.delete({ id: state.current!.id }))
    })
    Then('la liste est vide', () => {
      expect(state.list).toHaveLength(0)
    })
    And("il n'y a pas de projet courant", () => {
      expect(state.current).toBeNull()
    })
  })

  Scenario('Ouvrir un autre projet bascule le projet courant', ({ Given, When, Then, And }) => {
    let state = initProjectState()
    let atelier: Project

    Given('un projet courant nommé "Maison"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Maison' }))
    })
    And('un projet existant "Atelier" en base', () => {
      atelier = buildProject('Atelier')
      state = {
        ...state,
        list: [...state.list, { id: atelier.id, name: atelier.name }],
      }
    })
    When('j\'ouvre le projet "Atelier"', () => {
      state = projectReducer(state, projectActions.open(atelier))
    })
    Then('le projet courant est "Atelier"', () => {
      expect(state.current?.name).toBe('Atelier')
    })
    And('la liste contient 2 projets', () => {
      expect(state.list).toHaveLength(2)
    })
  })

  Scenario('Renommer le projet courant met à jour la liste', ({ Given, When, Then, And }) => {
    let state = initProjectState()

    Given('un projet courant nommé "Maison"', () => {
      state = projectReducer(state, projectActions.create({ name: 'Maison' }))
    })
    When('je renomme le projet courant en "Villa"', () => {
      state = projectReducer(state, projectActions.updateName({ name: 'Villa' }))
    })
    Then('le projet courant est "Villa"', () => {
      expect(state.current?.name).toBe('Villa')
    })
    And('la liste contient l\'entrée "Villa"', () => {
      expect(state.list.find(p => p.name === 'Villa')).toBeDefined()
    })
  })
})
