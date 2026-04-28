import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import {
  disambiguateName,
  projectFromJson,
  projectToJson,
  type SerializedImage,
} from '@/core/projectSerialize'
import type { Project } from '@/core/types'

const feature = await loadFeature('src/core/__tests__/project-serialize.feature', { language: 'fr' })

function makeProject(name: string, withPlan = false): Project {
  const p: Project = {
    id: 'proj-1',
    name,
    poseParams: { cale: 0.5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 },
    catalog: [
      {
        id: 'pt-1', projectId: 'proj-1', name: 'Chêne',
        length: 120, width: 14,
        pricing: { type: 'unit', pricePerUnit: 12.5 },
        description: 'lame chêne',
      },
    ],
    rooms: [
      {
        id: 'room-1', projectId: 'proj-1', name: 'Salon',
        vertices: [
          { x: 0, y: 0 }, { x: 400, y: 0 },
          { x: 400, y: 300 }, { x: 0, y: 300 },
        ],
        yOffset: 0,
        rows: [
          { id: 'row-1', roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 0 }] },
          { id: 'row-2', roomId: 'room-1', plankTypeId: 'pt-1', segments: [{ xOffset: 30 }] },
        ],
      },
    ],
  }
  if (withPlan) {
    p.backgroundPlan = {
      id: 'plan-1', projectId: 'proj-1',
      opacity: 0.7, rotation: 0, x: 0, y: 0,
      calibration: { point1: { x: 10, y: 10 }, point2: { x: 100, y: 10 }, realDistance: 200 },
    }
  }
  return p
}

describeFeature(feature, ({ Scenario }) => {

  Scenario('Round-trip export → import — projet sans plan', ({ Given, And, When, Then }) => {
    let original: Project
    let result: { project: Project; image?: SerializedImage }

    Given('un projet "Appart" avec catalogue, pièces et rangées', () => {
      original = makeProject('Appart')
    })
    When('je sérialise le projet en JSON puis le re-parse', () => {
      const json = projectToJson(original)
      result = projectFromJson(json)
    })
    Then('le projet résultant a le même nom', () => {
      expect(result.project.name).toBe('Appart')
    })
    And('le catalogue a les mêmes tailles et descriptions aux ids près', () => {
      expect(result.project.catalog).toHaveLength(1)
      const pt = result.project.catalog[0]
      expect(pt.name).toBe('Chêne')
      expect(pt.length).toBe(120)
      expect(pt.width).toBe(14)
      expect(pt.description).toBe('lame chêne')
    })
    And('les pièces ont les mêmes vertices et rangées aux ids près', () => {
      expect(result.project.rooms).toHaveLength(1)
      const room = result.project.rooms[0]
      expect(room.name).toBe('Salon')
      expect(room.vertices).toHaveLength(4)
      expect(room.rows).toHaveLength(2)
      expect(room.rows[0].segments[0].xOffset).toBe(0)
      expect(room.rows[1].segments[0].xOffset).toBe(30)
    })
    And('row.plankTypeId pointe vers le bon plankType remappé', () => {
      const pt = result.project.catalog[0]
      const row = result.project.rooms[0].rows[0]
      expect(row.plankTypeId).toBe(pt.id)
    })
    And('tous les ids sont régénérés', () => {
      expect(result.project.id).not.toBe('proj-1')
      expect(result.project.catalog[0].id).not.toBe('pt-1')
      expect(result.project.rooms[0].id).not.toBe('room-1')
      expect(result.project.rooms[0].rows[0].id).not.toBe('row-1')
    })
  })

  Scenario('Round-trip avec plan de fond — image incluse en base64', ({ Given, When, Then, And }) => {
    let json: string
    const image: SerializedImage = { name: 'plan.png', mimeType: 'image/png', dataUrl: 'data:image/png;base64,AAA' }

    Given('un projet "AppartPlan" avec un backgroundPlan sans imageFile', () => {
      // prepared below via makeProject(withPlan=true)
    })
    When('je sérialise en JSON avec une image "data:image/png;base64,AAA"', () => {
      json = projectToJson(makeProject('AppartPlan', true), image)
    })
    Then('le JSON contient la section image avec le dataUrl', () => {
      const parsed = JSON.parse(json)
      expect(parsed.image).toEqual(image)
    })
    And('le backgroundPlan du JSON ne contient pas imageFile', () => {
      const parsed = JSON.parse(json)
      expect(parsed.project.backgroundPlan).toBeDefined()
      expect(parsed.project.backgroundPlan.imageFile).toBeUndefined()
      expect(parsed.project.backgroundPlan.opacity).toBe(0.7)
    })
  })

  Scenario('Validation — version inconnue → erreur "Format non supporté"', ({ Given, When, Then }) => {
    let json: string

    Given('un JSON avec version 999 et un project valide', () => {
      const base = makeProject('X')
      json = JSON.stringify({
        version: 999,
        exportedAt: new Date().toISOString(),
        project: base,
      })
    })
    When('je tente de parser le JSON', () => {
      // no-op; assertion below
    })
    Then('une erreur "Format non supporté" est levée', () => {
      expect(() => projectFromJson(json)).toThrow('Format non supporté')
    })
  })

  Scenario('Validation — champ requis manquant → erreur "Fichier corrompu"', ({ Given, When, Then }) => {
    let json: string

    Given('un JSON sans poseParams dans project', () => {
      json = JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        project: { id: 'x', name: 'X', catalog: [], rooms: [] },
      })
    })
    When('je tente de parser le JSON', () => {})
    Then('une erreur "Fichier corrompu" est levée', () => {
      expect(() => projectFromJson(json)).toThrow('Fichier corrompu')
    })
  })

  Scenario('Validation — JSON invalide → erreur "Fichier corrompu"', ({ Given, When, Then }) => {
    let junk: string

    Given('une chaîne qui n\'est pas du JSON', () => {
      junk = 'definitely not json {{{'
    })
    When('je tente de parser le JSON', () => {})
    Then('une erreur "Fichier corrompu" est levée', () => {
      expect(() => projectFromJson(junk)).toThrow('Fichier corrompu')
    })
  })

  Scenario('Désambiguïsation du nom en cas de collision', ({ Given, When, Then }) => {
    let existing: string[]
    let result: string

    Given('une liste de projets existants ["Appart", "Appart (importé)"]', () => {
      existing = ['Appart', 'Appart (importé)']
    })
    When('je désambiguïse le nom "Appart"', () => {
      result = disambiguateName('Appart', existing)
    })
    Then('le nom résultant est "Appart (importé 2)"', () => {
      expect(result).toBe('Appart (importé 2)')
    })
  })

  Scenario('Import JSON clampe un yOffset hors bornes', ({ Given, When, Then }) => {
    let json: string
    let imported: Project

    Given('un JSON valide avec une pièce yOffset -99 cm et un type de lame de largeur 14 cm', () => {
      const base = makeProject('OffOut')
      base.rooms[0].yOffset = -99
      json = projectToJson(base)
    })
    When('je parse le JSON', () => {
      imported = projectFromJson(json).project
    })
    Then('la pièce importée a un yOffset clampé à -14 cm', () => {
      // catalog max width = 14 → clamp à -14
      expect(imported.rooms[0].yOffset).toBeCloseTo(-14, 5)
    })
  })

})
