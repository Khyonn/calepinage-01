import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectRoomYOffsetBounds } from '@/store/selectors'
import { projectActions } from '@/store/projectSlice'
import { Input } from '@/components/ui/Input'
import styles from './RoomEditPanel.module.css'

interface Props {
  roomId: string
  yOffsetCm: number
}

const formatCm = (cm: number) => (Math.round(cm * 10) / 10).toString()

/**
 * Décalage Y de la pièce — saisi côté UI en cm positifs (plus naturel pour
 * l'utilisateur), stocké en cm négatifs côté state. `step=0.1` (précision mm).
 * Live update : chaque saisie parseable est dispatchée immédiatement.
 * Désactivé si catalog vide.
 */
export function YOffsetField({ roomId, yOffsetCm }: Props) {
  const bounds = useAppSelector(selectRoomYOffsetBounds)
  const dispatch = useAppDispatch()

  const disabled = bounds.min === 0 && bounds.max === 0
  const maxAbs = -bounds.min // borne haute UI en valeur positive

  const [draft, setDraft] = useState<string>(formatCm(-yOffsetCm))

  useEffect(() => {
    setDraft(formatCm(-yOffsetCm))
  }, [yOffsetCm])

  const handleChange = (raw: string) => {
    setDraft(raw)
    // Dispatch live si parseable. Saisies intermédiaires ("", "-", "1.") ignorées.
    const parsed = Number.parseFloat(raw)
    if (!Number.isFinite(parsed)) return
    const positive = Math.min(maxAbs, Math.max(0, parsed))
    dispatch(projectActions.setRoomYOffset({ id: roomId, yOffset: -positive }))
  }

  const normalize = () => setDraft(formatCm(-yOffsetCm))

  return (
    <div className={styles.section}>
      <Input
        type="number"
        label="Remonter première rangée (cm)"
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={normalize}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
        min={0}
        max={maxAbs}
        step={0.1}
        disabled={disabled}
      />
      {disabled && <p className={styles.emptyHint}>Ajoutez un type de lame pour activer le décalage.</p>}
    </div>
  )
}
