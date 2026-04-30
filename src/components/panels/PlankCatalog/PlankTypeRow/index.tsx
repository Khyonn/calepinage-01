import { Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { extractFirstUrl } from '@/core/utils/url'
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
  const url = extractFirstUrl(type.description)
  const hasDescription = type.description.trim().length > 0

  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <div className={styles.nameLine}>
          {url
            ? <a className={styles.name} href={url} target="_blank" rel="noreferrer">{type.name}</a>
            : <span className={styles.name}>{type.name}</span>}
          {hasDescription && (
            <Tooltip content={type.description}>
              <span className={styles.infoIcon} aria-label="Description">
                <Info size={14} />
              </span>
            </Tooltip>
          )}
        </div>
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
