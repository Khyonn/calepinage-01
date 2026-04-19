import { useRef } from 'react'
import { useAppSelector } from '@/hooks/redux'
import { selectBackgroundPlan, selectBackgroundPlanScale, selectInteractionMode } from '@/store/selectors'
import { useObjectURL } from './useObjectURL'
import { useImageDimensions } from './useImageDimensions'
import { useBackgroundPlanDrag } from './useBackgroundPlanDrag'
import styles from './BackgroundPlan.module.css'

export function BackgroundPlan() {
  const plan = useAppSelector(selectBackgroundPlan)
  const scale = useAppSelector(selectBackgroundPlanScale)
  const mode = useAppSelector(selectInteractionMode)
  const imageRef = useRef<SVGImageElement | null>(null)

  const url = useObjectURL(plan?.imageFile)
  const dims = useImageDimensions(url)

  useBackgroundPlanDrag({ imageRef, plan, mode })

  if (!plan || !url || !dims) return null

  const w = dims.naturalWidth * scale
  const h = dims.naturalHeight * scale
  const cx = w / 2
  const cy = h / 2
  const draggable = mode === 'plan'

  return (
    <g transform={`translate(${plan.x} ${plan.y}) rotate(${plan.rotation} ${cx} ${cy})`}>
      <image
        ref={imageRef}
        href={url}
        width={w}
        height={h}
        opacity={plan.opacity}
        className={draggable ? styles.draggable : undefined}
        preserveAspectRatio="none"
      />
    </g>
  )
}
