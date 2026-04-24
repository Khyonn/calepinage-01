import { useAppSelector } from '@/hooks/redux'
import { selectCatalog, selectSummary } from '@/store/selectors'
import type { PlankType, PlankTypeSummary } from '@/core/types'
import styles from './SummaryTable.module.css'

function formatEuro(value: number): string {
  return `${value.toFixed(2)} €`
}

function unitCost(plankType: PlankType): number {
  return plankType.pricing.type === 'unit'
    ? plankType.pricing.pricePerUnit
    : plankType.pricing.pricePerLot / plankType.pricing.lotSize
}

export function SummaryTable() {
  const summary = useAppSelector(selectSummary)
  const catalog = useAppSelector(selectCatalog)

  const rows = (summary?.byType ?? []).filter(s => s.planksNeeded > 0)

  if (rows.length === 0) {
    return (
      <p className={styles.empty}>
        Ajoutez des rangées pour voir le résumé.
      </p>
    )
  }

  const catalogById = new Map(catalog.map(pt => [pt.id, pt]))

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Type de lame</th>
          <th scope="col" className={styles.num}>Quantité</th>
          <th scope="col" className={styles.num}>Coût unitaire</th>
          <th scope="col" className={styles.num}>Coût total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s: PlankTypeSummary) => {
          const plankType = catalogById.get(s.plankTypeId)
          if (!plankType) return null
          return (
            <tr key={s.plankTypeId}>
              <td>
                <div className={styles.typeName}>{plankType.name}</div>
                <div className={styles.typeDims}>
                  {plankType.length} × {plankType.width} cm
                </div>
              </td>
              <td className={styles.num}>{s.planksNeeded}</td>
              <td className={styles.num}>{formatEuro(unitCost(plankType))}</td>
              <td className={styles.num}>{formatEuro(s.cost)}</td>
            </tr>
          )
        })}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colSpan={3}>Total</th>
          <td className={styles.num}>{formatEuro(summary?.totalCost ?? 0)}</td>
        </tr>
      </tfoot>
    </table>
  )
}
