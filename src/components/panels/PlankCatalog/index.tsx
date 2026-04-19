import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useAppSelector } from '@/hooks/redux'
import { selectCatalog, selectPlankTypeUsage } from '@/store/selectors'
import type { PlankType } from '@/core/types'
import { PlankTypeRow } from './PlankTypeRow'
import { PlankTypeForm } from './PlankTypeForm'
import { DeletePlankTypeConfirm } from './DeletePlankTypeConfirm'
import styles from './PlankCatalog.module.css'

type FormState = null | { mode: 'add' } | { mode: 'edit'; type: PlankType }

export function PlankCatalog() {
  const catalog = useAppSelector(selectCatalog)
  const usage = useAppSelector(selectPlankTypeUsage)
  const [form, setForm] = useState<FormState>(null)
  const [toDelete, setToDelete] = useState<PlankType | null>(null)

  return (
    <section className={styles.catalog} aria-label="Catalogue de lames">
      <div className={styles.head}>
        <h3 className={styles.title}>Catalogue</h3>
        <Button size="sm" variant="primary" onClick={() => setForm({ mode: 'add' })}>
          + Ajouter
        </Button>
      </div>

      {catalog.length === 0 ? (
        <p className={styles.empty}>Aucun type de lame pour l'instant.</p>
      ) : (
        <ul className={styles.list}>
          {catalog.map(pt => (
            <li key={pt.id}>
              <PlankTypeRow
                type={pt}
                usageCount={usage.get(pt.id) ?? 0}
                onEdit={() => setForm({ mode: 'edit', type: pt })}
                onDelete={() => setToDelete(pt)}
              />
            </li>
          ))}
        </ul>
      )}

      {form && (
        <PlankTypeForm
          initial={form.mode === 'edit' ? form.type : null}
          locked={form.mode === 'edit' ? (usage.get(form.type.id) ?? 0) > 0 : false}
          onClose={() => setForm(null)}
        />
      )}

      {toDelete && (
        <DeletePlankTypeConfirm type={toDelete} onClose={() => setToDelete(null)} />
      )}
    </section>
  )
}
