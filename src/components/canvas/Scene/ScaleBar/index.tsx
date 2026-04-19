import { pickNiceScale } from '@/core/viewport'
import styles from './ScaleBar.module.css'

interface Props {
  zoom: number
}

const TARGET_PX = 96

export function ScaleBar({ zoom }: Props) {
  const targetWorldSpanCm = TARGET_PX / zoom
  const scale = pickNiceScale(targetWorldSpanCm)
  const widthPx = scale.spanCm * zoom
  const label = `${scale.value} ${scale.unit}`

  return (
    <div className={styles.wrapper} aria-label={`Échelle ${label}`}>
      <div className={styles.bar} style={{ width: `${widthPx}px` }}>
        <span className={styles.tickStart} />
        <span className={styles.line} />
        <span className={styles.tickEnd} />
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
