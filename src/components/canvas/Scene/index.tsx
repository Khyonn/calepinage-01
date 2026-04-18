import { useRef } from 'react'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectRooms, selectCurrentProject, selectInteractionMode, selectViewport } from '@/store/selectors'
import { uiActions } from '@/store/uiSlice'
import type { AppDispatch } from '@/store/types'
import { useCanvasEvents } from './useCanvasEvents'
import { centerViewport, roomsBoundingBox } from '@/hooks/viewport'
import { Room } from '@/components/canvas/Room'
import { BackgroundPlan } from '@/components/canvas/BackgroundPlan'
import styles from './Scene.module.css'

const GRID_STEP_CM = 10
const DEFAULT_ZOOM = 4

export function Scene() {
  const dispatch = useDispatch<AppDispatch>()
  const svgRef = useRef<SVGSVGElement>(null)

  const viewport = useSelector(selectViewport)
  const mode = useSelector(selectInteractionMode)
  const rooms = useSelector(selectRooms)
  const project = useSelector(selectCurrentProject)

  const viewportRef = useRef(viewport)
  viewportRef.current = viewport

  const modeRef = useRef(mode)
  modeRef.current = mode

  const roomsRef = useRef(rooms)
  roomsRef.current = rooms

  useCanvasEvents(svgRef, viewportRef, modeRef)

  // Centre le viewport au montage
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const bbox = roomsBoundingBox(roomsRef.current)
    if (bbox) {
      dispatch(uiActions.setViewport(centerViewport(bbox, rect.width, rect.height, DEFAULT_ZOOM)))
    } else {
      dispatch(uiActions.setViewport({ zoom: DEFAULT_ZOOM, panX: rect.width / 2, panY: rect.height / 2 }))
    }
  }, [dispatch]) // eslint-disable-line react-hooks/exhaustive-deps

  const { zoom, panX, panY } = viewport
  const gridSize = GRID_STEP_CM * zoom
  const gridOffsetX = ((panX % gridSize) + gridSize) % gridSize
  const gridOffsetY = ((panY % gridSize) + gridSize) % gridSize

  return (
    <svg
      ref={svgRef}
      className={styles.canvas}
      tabIndex={0}
      aria-label="Canvas calepinage"
    >
      <defs>
        <pattern
          id="canvas-grid"
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
          x={gridOffsetX}
          y={gridOffsetY}
        >
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke="var(--grid-color)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#canvas-grid)" />

      <g transform={`translate(${panX},${panY}) scale(${zoom})`}>
        {project?.backgroundPlan && (
          <BackgroundPlan plan={project.backgroundPlan} />
        )}
        {rooms.map(room => (
          <Room key={room.id} room={room} />
        ))}
      </g>
    </svg>
  )
}
