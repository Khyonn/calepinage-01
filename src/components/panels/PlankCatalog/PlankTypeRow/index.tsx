import { Button } from '@/components/ui/Button'
import type { PlankType } from '@/core/types'
import styles from './PlankTypeRow.module.css'

interface Props {
  type: PlankType
  usageCount: number
  onEdit: () => void
  onDelete: () => void
}

function pricingLabel(type: PlankType): string {
  if (type.pricing.type === 'unit') return `${type.pricing.pricePerUnit} €/lame`
  return `${type.pricing.pricePerLot} €/lot de ${type.pricing.lotSize}`
}

export function PlankTypeRow({ type, usageCount, onEdit, onDelete }: Props) {
  const inUse = usageCount > 0

  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <div className={styles.name}>{type.name}</div>
        <div className={styles.meta}>
          {type.length} × {type.width} cm · {pricingLabel(type)}
        </div>
        <div className={inUse ? styles.badgeUse : styles.badgeUnused}>
          {inUse ? `Utilisé dans ${usageCount} rangée${usageCount > 1 ? 's' : ''}` : 'Non utilisé'}
        </div>
      </div>
      <div className={styles.actions}>
        <Button size="sm" variant="ghost" onClick={onEdit}>Éditer</Button>
        <Button size="sm" variant="danger" disabled={inUse} onClick={onDelete}>
          Supprimer
        </Button>
      </div>
    </div>
  )
}
