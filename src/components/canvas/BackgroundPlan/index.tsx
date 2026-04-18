import { useEffect, useState } from 'react'
import type { BackgroundPlan as BackgroundPlanType } from '@/core/types'
import styles from './BackgroundPlan.module.css'

interface BackgroundPlanProps {
  plan: BackgroundPlanType
}

interface Dimensions {
  width: number
  height: number
}

function calcScale(plan: BackgroundPlanType): number {
  if (!plan.calibration) return 1
  const { point1, point2, realDistance } = plan.calibration
  const px = Math.hypot(point2.x - point1.x, point2.y - point1.y)
  return px > 0 ? realDistance / px : 1
}

export function BackgroundPlan({ plan }: BackgroundPlanProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [dims, setDims] = useState<Dimensions | null>(null)

  useEffect(() => {
    if (!plan.imageFile) return
    const url = URL.createObjectURL(plan.imageFile)
    setObjectUrl(url)

    const img = new Image()
    img.onload = () => {
      const scale = calcScale(plan)
      setDims({ width: img.naturalWidth * scale, height: img.naturalHeight * scale })
    }
    img.src = url

    return () => { URL.revokeObjectURL(url) }
  }, [plan.imageFile, plan.calibration])

  if (!objectUrl || !dims) return null

  const cx = plan.x + dims.width / 2
  const cy = plan.y + dims.height / 2
  const transform = plan.rotation !== 0
    ? `rotate(${plan.rotation}, ${cx}, ${cy})`
    : undefined

  return (
    <image
      href={objectUrl}
      x={plan.x}
      y={plan.y}
      width={dims.width}
      height={dims.height}
      opacity={plan.opacity}
      transform={transform}
      className={styles.image}
    />
  )
}
