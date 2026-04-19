import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/Input'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectPoseParams } from '@/store/selectors'
import { projectActions } from '@/store/projectSlice'
import type { PoseParams } from '@/core/types'
import styles from './PoseParamsForm.module.css'

type Field = keyof PoseParams

const parseNum = (s: string): number => {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}

export function PoseParamsForm() {
  const pose = useAppSelector(selectPoseParams)
  const dispatch = useAppDispatch()
  const [draft, setDraft] = useState<Record<Field, string>>({
    cale: '', sawWidth: '', minPlankLength: '', minRowGap: '',
  })

  useEffect(() => {
    if (!pose) return
    setDraft({
      cale: String(pose.cale),
      sawWidth: String(pose.sawWidth),
      minPlankLength: String(pose.minPlankLength),
      minRowGap: String(pose.minRowGap),
    })
  }, [pose?.cale, pose?.sawWidth, pose?.minPlankLength, pose?.minRowGap])

  if (!pose) return null

  const commit = (field: Field) => {
    const n = parseNum(draft[field])
    if (!Number.isFinite(n) || n < 0) {
      setDraft(d => ({ ...d, [field]: String(pose[field]) }))
      return
    }
    if (n === pose[field]) return
    dispatch(projectActions.updatePoseParams({ ...pose, [field]: n }))
  }

  const bind = (field: Field) => ({
    value: draft[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setDraft(d => ({ ...d, [field]: e.currentTarget.value })),
    onBlur: () => commit(field),
  })

  return (
    <section className={styles.form} aria-label="Paramètres de pose">
      <h3 className={styles.title}>Paramètres de pose</h3>
      <div className={styles.grid}>
        <Input label="Cale dilatation (cm)" type="number" min={0} step="0.1" inputMode="decimal" {...bind('cale')} />
        <Input label="Largeur scie (cm)" type="number" min={0} step="0.1" inputMode="decimal" {...bind('sawWidth')} />
        <Input label="Long. min lame (cm)" type="number" min={0} step="1" inputMode="decimal" {...bind('minPlankLength')} />
        <Input label="Écart min joints (cm)" type="number" min={0} step="1" inputMode="decimal" {...bind('minRowGap')} />
      </div>
    </section>
  )
}
