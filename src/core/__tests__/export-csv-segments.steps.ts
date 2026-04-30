import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { projectToCsv, CSV_EOL, CSV_SEPARATOR } from '@/core/exportCsv'
import type { OffcutLink, PlankType, PoseParams, Project, Room } from '@/core/types'

const feature = await loadFeature('src/core/__tests__/export-csv-segments.feature', { language: 'fr' })

const POSE_PARAMS: PoseParams = { cale: 0.5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }

function makePlankType(name: string, length: number, width: number): PlankType {
  return {
    id: `pt-${name}`, projectId: 'proj', name,
    length, width,
    pricing: { type: 'unit', pricePerUnit: 10 },
    description: '',
  }
}

function makeRoom(id: string, width: number, plankType: PlankType, rows: { id: string; xOffset: number }[]): Room {
  return {
    id,
    projectId: 'proj',
    name: id,
    vertices: [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: 100 }, { x: 0, y: 100 }],
    yOffset: 0,
    rows: rows.map(r => ({
      id: r.id,
      roomId: id,
      plankTypeId: plankType.id,
      segments: [{ xOffset: r.xOffset }],
    })),
  }
}

function makeProject(rooms: Room[], catalog: PlankType[]): Project {
  return { id: 'proj', name: 'Test', poseParams: POSE_PARAMS, catalog, rooms }
}

function parseDetailLines(csv: string, roomName: string): string[][] {
  const marker = `# Détail — ${roomName}`
  const block = csv.split(marker)[1]
  if (!block) return []
  const next = block.indexOf('\r\n# ')
  const section = next !== -1 ? block.slice(0, next) : block
  return section
    .split(CSV_EOL)
    .filter(l => l.trim() && !l.startsWith('Rangée'))
    .map(l => l.split(CSV_SEPARATOR))
}

describeFeature(feature, ({ Scenario }) => {
  let catalog: PlankType[]
  let rooms: Room[]
  let offcutLinks: OffcutLink[]
  let csv: string

  function exportProject() {
    csv = projectToCsv(makeProject(rooms, catalog), null, offcutLinks)
  }

  Scenario('Segment commençant par une lame complète', ({ Given, When, Then, And }) => {
    Given('une pièce de 500 cm avec une rangée du type "Chêne" 120×10 cm xOffset 0', () => {
      const pt = makePlankType('Chêne', 120, 10)
      catalog = [pt]
      rooms = [makeRoom('Salon', 500, pt, [{ id: 'row-1', xOffset: 0 }])]
      offcutLinks = []
    })
    When("j'exporte le CSV", () => exportProject())
    Then('la ligne de détail du segment 1 a la première lame vide', () => {
      const lines = parseDetailLines(csv, 'Salon')
      expect(lines.length).toBeGreaterThan(0)
      // columns: Rangée;Type;Segment;Première lame;Source;Lames complètes;Dernière lame;Destination
      expect(lines[0][3]).toBe('')
    })
    And('la colonne "Lames complètes" vaut "4"', () => {
      const lines = parseDetailLines(csv, 'Salon')
      expect(lines[0][5]).toBe('4')
    })
    And('la colonne "Dernière lame" est non vide', () => {
      const lines = parseDetailLines(csv, 'Salon')
      expect(lines[0][6]).not.toBe('')
    })
  })

  Scenario('Segment d\'une seule lame incomplète', ({ Given, When, Then, And }) => {
    Given('une pièce de 50 cm avec une rangée du type "Sapin" 120×10 cm xOffset 0', () => {
      const pt = makePlankType('Sapin', 120, 10)
      catalog = [pt]
      rooms = [makeRoom('Garage', 50, pt, [{ id: 'row-1', xOffset: 0 }])]
      offcutLinks = []
    })
    When("j'exporte le CSV", () => exportProject())
    Then('la ligne de détail du segment 1 a la première lame non vide', () => {
      const lines = parseDetailLines(csv, 'Garage')
      expect(lines[0][3]).not.toBe('')
    })
    And('la colonne "Lames complètes" est vide dans cette ligne', () => {
      const lines = parseDetailLines(csv, 'Garage')
      expect(lines[0][5]).toBe('')
    })
    And('la colonne "Dernière lame" est vide dans cette ligne', () => {
      const lines = parseDetailLines(csv, 'Garage')
      expect(lines[0][6]).toBe('')
    })
  })

  Scenario('Segment avec source de chute réutilisée', ({ Given, And, When, Then }) => {
    Given('deux rangées dans une pièce de 400 cm du type "Pin" 100×10 cm', () => {
      const pt = makePlankType('Pin', 100, 10)
      catalog = [pt]
      rooms = [makeRoom('Bureau', 400, pt, [
        { id: 'row-1', xOffset: 0 },
        { id: 'row-2', xOffset: 30 },
      ])]
      offcutLinks = []
    })
    And('la deuxième rangée a xOffset 30 cm', () => { /* already set */ })
    And('un lien source de la rangée 1 vers la rangée 2', () => {
      offcutLinks = [{ sourceRowId: 'row-1', targetRowId: 'row-2', length: 30 }]
    })
    When("j'exporte le CSV", () => exportProject())
    Then('la ligne de la rangée 2 a la colonne "Source" remplie avec "rangée 1"', () => {
      const lines = parseDetailLines(csv, 'Bureau')
      const row2 = lines.find(l => l[0] === '2')
      expect(row2).toBeDefined()
      expect(row2![4]).toContain('rangée 1')
    })
  })

  Scenario('Segment avec destination de chute réutilisée', ({ Given, And, When, Then }) => {
    Given('deux rangées dans une pièce de 400 cm du type "Pin" 100×10 cm', () => {
      const pt = makePlankType('Pin', 100, 10)
      catalog = [pt]
      rooms = [makeRoom('Bureau', 400, pt, [
        { id: 'row-1', xOffset: 0 },
        { id: 'row-2', xOffset: 30 },
      ])]
      offcutLinks = []
    })
    And('la deuxième rangée a xOffset 30 cm', () => { /* already set */ })
    And('un lien source de la rangée 1 vers la rangée 2', () => {
      offcutLinks = [{ sourceRowId: 'row-1', targetRowId: 'row-2', length: 30 }]
    })
    When("j'exporte le CSV", () => exportProject())
    Then('la ligne de la rangée 1 a la colonne "Destination" remplie avec "rangée 2"', () => {
      const lines = parseDetailLines(csv, 'Bureau')
      const row1 = lines.find(l => l[0] === '1')
      expect(row1).toBeDefined()
      expect(row1![7]).toContain('rangée 2')
    })
  })
})
