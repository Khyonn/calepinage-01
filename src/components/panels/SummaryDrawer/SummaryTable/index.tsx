import { useAppSelector } from '@/hooks/redux'
import { selectCatalog, selectSummary } from '@/store/selectors'
import type { PlankType, PlankTypeSummary } from '@/core/types'
import styles from './SummaryTable.module.css'

const euro = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatEuro(value: number): string {
  return euro.format(value)
}

interface QuantityDisplay {
  primary: string
  secondary?: string
}

function quantityDisplay(planksNeeded: number, plankType: PlankType): QuantityDisplay {
  const { pricing } = plankType
  if (pricing.type === 'unit') {
    return { primary: `${planksNeeded} unité${planksNeeded > 1 ? 's' : ''}` }
  }
  const lots = Math.ceil(planksNeeded / pricing.lotSize)
  return {
    primary: `${lots} lot${lots > 1 ? 's' : ''} de ${pricing.lotSize}`,
    secondary: `${planksNeeded} unité${planksNeeded > 1 ? 's' : ''}`,
  }
}

interface UnitCostDisplay {
  amount: string
  basis: string
}

function unitCostDisplay(plankType: PlankType): UnitCostDisplay {
  const { pricing } = plankType
  if (pricing.type === 'unit') {
    return { amount: formatEuro(pricing.pricePerUnit), basis: '/ unité' }
  }
  return { amount: formatEuro(pricing.pricePerLot), basis: '/ lot' }
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
          <th scope="col">Lames</th>
          <th scope="col" className={styles.num}>Quantité</th>
          <th scope="col" className={styles.num}>Coût unit.</th>
          <th scope="col" className={styles.num}>Coût total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s: PlankTypeSummary) => {
          const plankType = catalogById.get(s.plankTypeId)
          if (!plankType) return null
          const qty = quantityDisplay(s.planksNeeded, plankType)
          const unit = unitCostDisplay(plankType)
          return (
            <tr key={s.plankTypeId}>
              <td>
                <div className={styles.typeName}>{plankType.name}</div>
                <div className={styles.typeDims}>
                  {plankType.length} × {plankType.width} cm
                </div>
              </td>
              <td className={styles.num}>
                <div>{qty.primary}</div>
                {qty.secondary && <div className={styles.secondary}>{qty.secondary}</div>}
              </td>
              <td className={styles.num}>
                <div>{unit.amount}</div>
                <div className={styles.secondary}>{unit.basis}</div>
              </td>
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
