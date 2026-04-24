import type {
  OffcutLink, PlankType, Project, SummaryResult,
} from '@/core/types'

export const CSV_BOM = '\ufeff'
export const CSV_SEPARATOR = ';'
export const CSV_EOL = '\r\n'

/**
 * Serialize a project to a CSV string suitable for Excel / LibreOffice.
 * Multi-section, `;` separator, UTF-8 BOM prefix, `\r\n` line endings.
 */
export function projectToCsv(
  project: Project,
  summary: SummaryResult | null,
  offcutLinks: OffcutLink[],
): string {
  const lines: string[] = []

  lines.push('# Résumé matière')
  lines.push(row(['Type de lame', 'Quantité', 'Coût unitaire (€)', 'Coût total (€)']))
  let emittedSummaryRows = 0
  for (const s of summary?.byType ?? []) {
    if (s.planksNeeded === 0) continue
    const plankType = project.catalog.find(pt => pt.id === s.plankTypeId)
    if (!plankType) continue
    lines.push(row([
      describePlank(plankType),
      String(s.planksNeeded),
      unitCost(plankType).toFixed(2),
      s.cost.toFixed(2),
    ]))
    emittedSummaryRows++
  }
  if (summary && emittedSummaryRows > 0) {
    lines.push(row(['Total', '', '', summary.totalCost.toFixed(2)]))
  }
  lines.push('')

  lines.push('# Liens de réutilisation')
  lines.push(row(['Pièce source', 'Rangée source', 'Pièce cible', 'Rangée cible', 'Longueur réutilisée (cm)']))
  for (const link of offcutLinks) {
    const source = resolveRow(project, link.sourceRowId)
    const target = resolveRow(project, link.targetRowId)
    if (!source || !target) continue
    lines.push(row([
      source.roomName, String(source.rowIndex + 1),
      target.roomName, String(target.rowIndex + 1),
      link.length.toFixed(1),
    ]))
  }
  lines.push('')

  lines.push('# Paramètres de pose')
  lines.push(row(['Cale (cm)', 'Largeur de scie (cm)', 'Longueur min (cm)', 'Écart rangées min (cm)']))
  const pp = project.poseParams
  lines.push(row([
    pp.cale.toFixed(1),
    pp.sawWidth.toFixed(1),
    pp.minPlankLength.toFixed(1),
    pp.minRowGap.toFixed(1),
  ]))

  return CSV_BOM + lines.join(CSV_EOL) + CSV_EOL
}

function row(cells: string[]): string {
  return cells.map(escapeCell).join(CSV_SEPARATOR)
}

function escapeCell(value: string): string {
  if (value.includes(CSV_SEPARATOR) || value.includes('"') || value.includes('\r') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function describePlank(plankType: PlankType): string {
  return `${plankType.name} ${plankType.length}×${plankType.width} cm`
}

function unitCost(plankType: PlankType): number {
  return plankType.pricing.type === 'unit'
    ? plankType.pricing.pricePerUnit
    : plankType.pricing.pricePerLot / plankType.pricing.lotSize
}

interface ResolvedRow {
  roomName: string
  rowIndex: number
}

function resolveRow(project: Project, rowId: string): ResolvedRow | null {
  for (const room of project.rooms) {
    const rowIndex = room.rows.findIndex(r => r.id === rowId)
    if (rowIndex !== -1) return { roomName: room.name, rowIndex }
  }
  return null
}
