import { useState, type KeyboardEvent } from 'react'
import { Check, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import styles from './CalibrationForm.module.css'

interface Props {
  initialDistance: number | null
  onCancel: () => void
  onValidate: (distance: number) => void
}

const parseNum = (s: string): number => {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}

export function CalibrationForm({ initialDistance, onCancel, onValidate }: Props) {
  const [draft, setDraft] = useState<string>(initialDistance != null ? String(initialDistance) : '')

  const commit = () => {
    const n = parseNum(draft)
    if (!Number.isFinite(n) || n <= 0) return
    onValidate(n)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <div>
      <p className={styles.help}>
        Déplacez les points <strong>A</strong> et <strong>B</strong> sur le plan, puis saisissez la distance réelle.
      </p>
      <div className={styles.inline}>
        <div className={styles.inputWrap}>
          <Input
            label="Distance réelle (cm)"
            type="number"
            min={0}
            step="0.1"
            inputMode="decimal"
            autoFocus
            value={draft}
            onChange={e => setDraft(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            placeholder="ex. 300"
          />
        </div>
        <Button variant="ghost" size="sm" iconOnly onClick={onCancel} aria-label="Annuler la calibration" className={styles.actionBtn}>
          <X size={16} />
        </Button>
        <Button variant="primary" size="sm" iconOnly onClick={commit} aria-label="Valider la calibration" className={styles.actionBtn}>
          <Check size={16} />
        </Button>
      </div>
    </div>
  )
}
