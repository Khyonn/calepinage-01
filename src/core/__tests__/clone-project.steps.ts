import { expect } from 'vitest'
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'
import { cloneProject, type CloneOptions } from '@/core/cloneProject'
import { DEFAULT_POSE_PARAMS } from '@/core/defaults'
import type { Project } from '@/core/types'

const feature = await loadFeature('src/core/__tests__/clone-project.feature', { language: 'fr' })

const ALL_ON: CloneOptions = {
  catalog: true, poseParams: true, backgroundPlan: true, rooms: true, rows: true,
}
const ALL_OFF: CloneOptions = {
  catalog: false, poseParams: false, backgroundPlan: false, rooms: false, rows: false,
}

function makeSource(opts: { customPose?: boolean; withPlan?: boolean } = {}): Project {
  const project: Project = {
    id: 'proj-src',
    name: 'Source',
    poseParams: opts.customPose
      ? { cale: 2, sawWidth: 0.1, minPlankLength: 50, minRowGap: 15 }
      : { ...DEFAULT_POSE_PARAMS },
    catalog: [
      {
        id: 'pt-a', projectId: 'proj-src', name: 'A',
        length: 120, width: 14,
        pricing: { type: 'unit', pricePerUnit: 10 },
        description: '',
      },
      {
        id: 'pt-b', projectId: 'proj-src', name: 'B',
        length: 200, width: 18,
        pricing: { type: 'lot', pricePerLot: 50, lotSize: 6 },
        description: '',
      },
    ],
    rooms: [
      {
        id: 'room-1', projectId: 'proj-src', name: 'Pièce',
        vertices: [
          { x: 0, y: 0 }, { x: 400, y: 0 }, { x: 400, y: 300 }, { x: 0, y: 300 },
        ],
        rows: [
          { id: 'row-1', roomId: 'room-1', plankTypeId: 'pt-a', segments: [{ xOffset: 0 }] },
          { id: 'row-2', roomId: 'room-1', plankTypeId: 'pt-a', segments: [{ xOffset: 30 }] },
        ],
      },
    ],
  }
  if (opts.withPlan) {
    project.backgroundPlan = {
      id: 'plan-1', projectId: 'proj-src',
      opacity: 0.7, rotation: 0, x: 0, y: 0,
    }
  }
  return project
}

describeFeature(feature, ({ Scenario }) => {
  Scenario('Clone complet — toutes les options activées', ({ Given, When, Then, And }) => {
    let source: Project
    let clone: Project

    Given('un projet source avec catalogue, pose personnalisée, pièces, rangées et plan de fond', () => {
      source = makeSource({ customPose: true, withPlan: true })
    })
    When('je clone le projet avec toutes les options activées sous le nom "Copie complète"', () => {
      clone = cloneProject(source, ALL_ON, 'Copie complète')
    })
    Then('le clone a un id différent du source', () => {
      expect(clone.id).not.toBe(source.id)
    })
    And('le clone a le nom "Copie complète"', () => {
      expect(clone.name).toBe('Copie complète')
    })
    And('le catalogue du clone contient autant de types que la source', () => {
      expect(clone.catalog).toHaveLength(source.catalog.length)
      for (const pt of clone.catalog) {
        expect(pt.projectId).toBe(clone.id)
        expect(source.catalog.some(s => s.id === pt.id)).toBe(false)
      }
    })
    And('les rangées du clone référencent les nouveaux ids du catalogue cloné', () => {
      const clonedTypeIds = new Set(clone.catalog.map(pt => pt.id))
      for (const room of clone.rooms) {
        for (const row of room.rows) {
          expect(clonedTypeIds.has(row.plankTypeId)).toBe(true)
        }
      }
    })
    And('le pose params du clone est identique à la source', () => {
      expect(clone.poseParams).toEqual(source.poseParams)
    })
    And('le plan de fond est conservé', () => {
      expect(clone.backgroundPlan).toBeDefined()
      expect(clone.backgroundPlan!.projectId).toBe(clone.id)
      expect(clone.backgroundPlan!.id).not.toBe(source.backgroundPlan!.id)
    })
  })

  Scenario('Clone catalogue seul — pas de pièces', ({ Given, When, Then, And }) => {
    let source: Project
    let clone: Project

    Given('un projet source avec catalogue, pose, pièces et rangées', () => {
      source = makeSource()
    })
    When('je clone avec uniquement catalogue activé sous le nom "Catalogue seul"', () => {
      clone = cloneProject(source, { ...ALL_OFF, catalog: true }, 'Catalogue seul')
    })
    Then('le clone a 0 pièce', () => {
      expect(clone.rooms).toHaveLength(0)
    })
    And('le catalogue du clone contient autant de types que la source', () => {
      expect(clone.catalog).toHaveLength(source.catalog.length)
    })
  })

  Scenario('Clone sans pose — pose remplacée par les defaults', ({ Given, When, Then }) => {
    let source: Project
    let clone: Project

    Given('un projet source avec une pose personnalisée cale=2 minPlankLength=50', () => {
      source = makeSource({ customPose: true })
    })
    When('je clone avec catalogue et pose désactivés sous le nom "Sans pose"', () => {
      clone = cloneProject(source, ALL_OFF, 'Sans pose')
    })
    Then('le pose params du clone vaut les defaults', () => {
      expect(clone.poseParams).toEqual(DEFAULT_POSE_PARAMS)
    })
  })

  Scenario('Clone des rangées force pièces et catalogue', ({ Given, When, Then, And }) => {
    let source: Project
    let clone: Project

    Given('un projet source avec catalogue, pièces et rangées', () => {
      source = makeSource()
    })
    When('je clone avec uniquement rangées activé sous le nom "Cascade auto"', () => {
      clone = cloneProject(source, { ...ALL_OFF, rows: true }, 'Cascade auto')
    })
    Then('le clone a autant de pièces que la source', () => {
      expect(clone.rooms).toHaveLength(source.rooms.length)
    })
    And('le catalogue du clone contient autant de types que la source', () => {
      expect(clone.catalog).toHaveLength(source.catalog.length)
    })
    And('les rangées du clone référencent les nouveaux ids du catalogue cloné', () => {
      const clonedTypeIds = new Set(clone.catalog.map(pt => pt.id))
      for (const room of clone.rooms) {
        for (const row of room.rows) {
          expect(clonedTypeIds.has(row.plankTypeId)).toBe(true)
        }
      }
    })
  })

  Scenario('Clone pièces sans rangées — vertices conservés rows vidées', ({ Given, When, Then }) => {
    let source: Project
    let clone: Project

    Given('un projet source avec une pièce de 4 sommets et 2 rangées', () => {
      source = makeSource()
    })
    When('je clone avec pièces activé et rangées désactivé sous le nom "Vertices seuls"', () => {
      clone = cloneProject(source, { ...ALL_OFF, catalog: true, rooms: true }, 'Vertices seuls')
    })
    Then('le clone a 1 pièce avec 4 sommets et 0 rangée', () => {
      expect(clone.rooms).toHaveLength(1)
      expect(clone.rooms[0].vertices).toHaveLength(4)
      expect(clone.rooms[0].rows).toHaveLength(0)
    })
  })
})
