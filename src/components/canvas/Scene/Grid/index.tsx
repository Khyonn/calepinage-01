import type { Viewport } from '@/core/types'

interface Props {
  viewport: Viewport
  width: number
  height: number
}

const BASE_STEP_CM = 10

/**
 * Grid rendered as an SVG pattern in screen space.
 * Pattern pitch = BASE_STEP_CM (cm) × zoom, offset by pan so lines stay anchored
 * to world origin (not scrolling with the group transform).
 * Fallback to finer sub-grid when zoomed way out.
 */
export function Grid({ viewport, width, height }: Props) {
  const pitch = BASE_STEP_CM * viewport.zoom
  if (pitch < 4) return null

  const offsetX = ((viewport.panX % pitch) + pitch) % pitch
  const offsetY = ((viewport.panY % pitch) + pitch) % pitch

  return (
    <g data-grid>
      <defs>
        <pattern
          id="scene-grid"
          x={offsetX} y={offsetY}
          width={pitch} height={pitch}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${pitch} 0 L 0 0 L 0 ${pitch}`}
            fill="none"
            stroke="var(--grid-color)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
      </defs>
      <rect x={0} y={0} width={width} height={height} fill="url(#scene-grid)" />
    </g>
  )
}
