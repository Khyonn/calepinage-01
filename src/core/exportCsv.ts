import type { OffcutLink, Plank, PlankType, Project, SummaryResult } from '@/core/types'
import { computeRowGeometry } from '@/core/rowGeometry'

export const CSV_BOM = '﻿'
export const CSV_SEPARATOR = ';'
export const CSV_EOL = '\r\n'

const EPSILON = 0.001

interface SegmentDetail {
  firstPlank: number | null
  fullPlanks: number | null
  lastPlank: number | null
}

function describeSegment(planks: Plank[], plankType: PlankType): SegmentDetail {
  if (planks.length === 0) return { firstPlank: null, fullPlanks: null, lastPlank: null }
  const isFull = (p: Plank) => Math.abs(p.length - plankType.length) < EPSILON
  const first = planks[0]
  const last = planks[planks.length - 1]
  const fullCount = planks.filter(isFull).length
  return {
    firstPlank: isFull(first) ? null : first.length,
    fullPlanks: fullCount === 0 ? null : fullCount,
    lastPlank: (planks.length === 1 || isFull(last)) ? null : last.length,
  }
}

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

  for (const room of project.rooms) {
    lines.push(`# Détail — ${room.name}`)
    lines.push(row(['Rangée', 'Type de lame', 'Segment', 'Première lame (cm)', 'Source', 'Lames complètes', 'Dernière lame (cm)', 'Destination']))
    for (let ri = 0; ri < room.rows.length; ri++) {
      const geo = computeRowGeometry(room, ri, project.catalog, project.poseParams)
      if (!geo) continue
      const domRow = room.rows[ri]
      for (let si = 0; si < geo.segments.length; si++) {
        const seg = geo.segments[si]
        const detail = describeSegment(seg.planks, geo.plankType)
        let sourceLabel = ''
        if (si === 0 && (domRow.segments[0]?.xOffset ?? 0) > 0) {
          const link = offcutLinks.find(l => l.targetRowId === domRow.id)
          if (link) {
            const src = resolveRow(project, link.sourceRowId)
            if (src) sourceLabel = `rangée ${src.rowIndex + 1} de ${src.roomName}`
          }
        }
        let destLabel = ''
        if (si === geo.segments.length - 1) {
          const link = offcutLinks.find(l => l.sourceRowId === domRow.id)
          if (link) {
            const dst = resolveRow(project, link.targetRowId)
            if (dst) destLabel = `rangée ${dst.rowIndex + 1} de ${dst.roomName}`
          }
        }
        lines.push(row([
          String(ri + 1),
          describePlank(geo.plankType),
          String(si + 1),
          detail.firstPlank !== null ? detail.firstPlank.toFixed(1) : '',
          sourceLabel,
          detail.fullPlanks !== null ? String(detail.fullPlanks) : '',
          detail.lastPlank !== null ? detail.lastPlank.toFixed(1) : '',
          destLabel,
        ]))
      }
    }
    lines.push('')
  }

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
