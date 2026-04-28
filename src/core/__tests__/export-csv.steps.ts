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
    And('la sortie contient les trois sections attendues', () => {
      expect(csv).toContain('# Résumé matière')
      expect(csv).toContain('# Liens de réutilisation')
      expect(csv).toContain('# Paramètres de pose')
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
  })

  Scenario('Les liens de réutilisation sont écrits avec les numéros de rangée 1-indexés', ({ Given, And, When, Then }) => {
    Given('un catalogue contenant "Pin" 100×10 cm au prix unitaire 5 €', () => {
      catalog = [makePlank('Pin', 100, 10, 5)]
    })
    And('une pièce "Chambre" de 400 cm avec deux rangées du type "Pin"', () => {
      rooms = [{
        id: 'room-1', projectId: 'proj', name: 'Chambre',
        vertices: BASE_VERTICES,
        yOffset: 0,
        rows: [
          { id: 'row-1', roomId: 'room-1', plankTypeId: catalog[0].id, segments: [{ xOffset: 0 }] },
          { id: 'row-2', roomId: 'room-1', plankTypeId: catalog[0].id, segments: [{ xOffset: 30 }] },
        ],
      }]
    })
    And('un lien de réutilisation de 30 cm entre la rangée 1 et la rangée 2', () => {
      offcutLinks = [{ sourceRowId: 'row-1', targetRowId: 'row-2', length: 30 }]
    })
    When('j\'exporte le projet en CSV', () => exportProject())
    Then('la section liens contient "Chambre;1;Chambre;2;30.0"', () => {
      expect(csv).toContain('Chambre;1;Chambre;2;30.0')
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
    And('la section liens commence par l\'en-tête "Pièce source;Rangée source;Pièce cible;Rangée cible;Longueur réutilisée (cm)"', () => {
      expect(csv).toContain('Pièce source;Rangée source;Pièce cible;Rangée cible;Longueur réutilisée (cm)')
    })
  })

  Scenario('Un projet vide produit des sections sans lignes de données', ({ When, Then, And }) => {
    When('j\'exporte le projet en CSV', () => exportProject())
    Then('la section résumé ne contient que son en-tête', () => {
      const summaryHeader = 'Type de lame;Quantité;Coût unitaire (€);Coût total (€)'
      expect(csv).toContain(summaryHeader)
      const body = csv.replace(CSV_BOM, '')
      const summaryBlock = body.split('# Liens de réutilisation')[0]
      const summaryLines = summaryBlock.split(CSV_EOL).filter(l => l && !l.startsWith('#') && l !== summaryHeader)
      expect(summaryLines).toEqual([])
    })
    And('la section liens ne contient que son en-tête', () => {
      const linksHeader = 'Pièce source;Rangée source;Pièce cible;Rangée cible;Longueur réutilisée (cm)'
      const linksBlock = csv.split('# Liens de réutilisation')[1].split('# Paramètres de pose')[0]
      const linksLines = linksBlock.split(CSV_EOL).filter(l => l && l !== linksHeader)
      expect(linksLines).toEqual([])
    })
    And('la section paramètres contient "0.5;0.1;30.0;15.0"', () => {
      expect(csv).toContain('0.5;0.1;30.0;15.0')
    })
  })
})
