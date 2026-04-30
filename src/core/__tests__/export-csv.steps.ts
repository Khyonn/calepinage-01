import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { projectToCsv, CSV_BOM, CSV_EOL, CSV_SEPARATOR } from '@/core/exportCsv'
import { computeSummary } from '@/core/computeSummary'
import type {
  OffcutLink, PlankType, PoseParams, Project, Room,
} from '@/core/types'

const feature = await loadFeature('src/core/__tests__/export-csv.feature', { language: 'fr' })

const BASE_VERTICES = [
  { x: 0, y: 0 }, { x: 400, y: 0 },
  { x: 400, y: 300 }, { x: 0, y: 300 },
]

function makePlank(name: string, length: number, width: number, pricePerUnit: number): PlankType {
  return {
    id: `pt-${name}`, projectId: 'proj', name,
    length, width,
    pricing: { type: 'unit', pricePerUnit },
    description: '',
  }
}

describeFeature(feature, ({ Background, BeforeEachScenario, Scenario }) => {
  let project: Project
  let poseParams: PoseParams
  let catalog: PlankType[]
  let rooms: Room[]
  let offcutLinks: OffcutLink[]
  let csv: string

  BeforeEachScenario(() => {
    catalog = []
    rooms = []
    offcutLinks = []
    csv = ''
  })

  Background(({ Given }) => {
    Given('un projet nommé "Démo" avec paramètres de pose cale 0.5 cm scie 0.1 cm min 30 cm écart 15 cm', () => {
      poseParams = { cale: 0.5, sawWidth: 0.1, minPlankLength: 30, minRowGap: 15 }
    })
  })

  function exportProject() {
    project = {
      id: 'proj', name: 'Démo', poseParams,
      catalog, rooms,
    }
    const summary = computeSummary(rooms, catalog, poseParams, offcutLinks)
    csv = projectToCsv(project, summary, offcutLinks)
  }

  Scenario('La sortie commence par le BOM UTF-8 et utilise les séparateurs attendus', ({ When, Then, And }) => {
    When('j\'exporte le projet en CSV', () => exportProject())
    Then('la sortie commence par le BOM UTF-8', () => {
      expect(csv.startsWith(CSV_BOM)).toBe(true)
    })
    And('la sortie utilise "\\r\\n" comme fin de ligne', () => {
      expect(csv.endsWith(CSV_EOL)).toBe(true)
      expect(csv.split(CSV_EOL).length).toBeGreaterThan(1)
    })
    And('la sortie utilise ";" comme séparateur de colonnes', () => {
      expect(csv.includes(CSV_SEPARATOR)).toBe(true)
    })
    And('la sortie contient la section résumé matière', () => {
      expect(csv).toContain('# Résumé matière')
    })
  })

  Scenario('Le résumé matière contient une ligne par type avec coût', ({ Given, And, When, Then }) => {
    Given('un catalogue contenant "Chêne" 120×14 cm au prix unitaire 10 €', () => {
      catalog = [makePlank('Chêne', 120, 14, 10)]
    })
    And('une pièce "Salon" de 400 cm avec une rangée du type "Chêne"', () => {
      rooms = [{
        id: 'room-1', projectId: 'proj', name: 'Salon',
        vertices: BASE_VERTICES,
        yOffset: 0,
        rows: [{ id: 'row-1', roomId: 'room-1', plankTypeId: catalog[0].id, segments: [{ xOffset: 0 }] }],
      }]
    })
    When('j\'exporte le projet en CSV', () => exportProject())
    Then('la section résumé contient "Chêne 120×14 cm;4;10.00;40.00"', () => {
      expect(csv).toContain('Chêne 120×14 cm;4;10.00;40.00')
    })
    And('la section résumé contient "Total;;;40.00"', () => {
      expect(csv).toContain('Total;;;40.00')
    })
    And('la section détail contient "# Détail — Salon"', () => {
      expect(csv).toContain('# Détail — Salon')
    })
  })

  Scenario('Les caractères spéciaux dans les noms sont échappés', ({ Given, And, When, Then }) => {
    Given('un catalogue contenant "Hêtre; premium" 120×14 cm au prix unitaire 12 €', () => {
      catalog = [makePlank('Hêtre; premium', 120, 14, 12)]
    })
    And('une pièce "Salle \\"principale\\"" de 400 cm avec une rangée du type "Hêtre; premium"', () => {
      rooms = [{
        id: 'room-1', projectId: 'proj', name: 'Salle "principale"',
        vertices: BASE_VERTICES,
        yOffset: 0,
        rows: [{ id: 'row-1', roomId: 'room-1', plankTypeId: catalog[0].id, segments: [{ xOffset: 0 }] }],
      }]
    })
    When('j\'exporte le projet en CSV', () => exportProject())
    Then('la section résumé contient "\\"Hêtre; premium 120×14 cm\\";4;12.00;48.00"', () => {
      expect(csv).toContain('"Hêtre; premium 120×14 cm";4;12.00;48.00')
    })
  })

  Scenario('Un projet vide produit une section résumé sans lignes de données', ({ When, Then }) => {
    When('j\'exporte le projet en CSV', () => exportProject())
    Then('la section résumé ne contient que son en-tête', () => {
      const summaryHeader = 'Type de lame;Quantité;Coût unitaire (€);Coût total (€)'
      expect(csv).toContain(summaryHeader)
      const body = csv.replace(CSV_BOM, '')
      const afterSummaryTitle = body.split('# Résumé matière')[1] ?? ''
      const nextSection = afterSummaryTitle.indexOf('\r\n#')
      const summaryBlock = nextSection !== -1 ? afterSummaryTitle.slice(0, nextSection) : afterSummaryTitle
      const summaryLines = summaryBlock.split(CSV_EOL).filter(l => l && l !== summaryHeader)
      expect(summaryLines).toEqual([])
    })
  })
})
