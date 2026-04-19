import { useAppSelector } from '@/hooks/redux'
import { selectBackgroundPlan, selectBackgroundPlanScale } from '@/store/selectors'
import { useCalibrationContext } from '@/components/panels/PlanImportForm/CalibrationContext'
import { useViewportContext } from '@/components/canvas/Scene/ViewportContext'
import { useObjectURL } from '../useObjectURL'
import { useImageDimensions } from '../useImageDimensions'
import { OverlayPoint } from './OverlayPoint'
import { imagePointToWorld, type PlanTransform } from './geometry'
import styles from './CalibrationOverlay.module.css'

export function CalibrationOverlay() {
  const plan = useAppSelector(selectBackgroundPlan)
  const imageScale = useAppSelector(selectBackgroundPlanScale)
  const calib = useCalibrationContext()
  const { worldToScreen } = useViewportContext()
  const url = useObjectURL(plan?.imageFile)
  const dims = useImageDimensions(url)

  if (!plan || !dims || !calib?.active) return null

  const transform: PlanTransform = {
    planX: plan.x,
    planY: plan.y,
    rotationDeg: plan.rotation,
    imageScale,
    naturalWidth: dims.naturalWidth,
    naturalHeight: dims.naturalHeight,
  }

  const w1 = imagePointToWorld(calib.point1, transform)
  const w2 = imagePointToWorld(calib.point2, transform)
  const s1 = worldToScreen(w1)
  const s2 = worldToScreen(w2)

  return (
    <g>
      <line x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y} className={styles.line} />
      <OverlayPoint screenPoint={s1} label="A" transform={transform} onChange={calib.setPoint1} />
      <OverlayPoint screenPoint={s2} label="B" transform={transform} onChange={calib.setPoint2} />
    </g>
  )
}
