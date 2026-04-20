import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useViewport } from '@/hooks/useViewport'
import { useAppSelector } from '@/hooks/redux'
import { selectInteractionMode } from '@/store/selectors'
import { ViewportContext, type SceneContextValue } from './ViewportContext'
import { Grid } from './Grid'
import { ScaleBar } from './ScaleBar'
import { useCanvasEvents } from './useCanvasEvents'
import styles from './Scene.module.css'

interface Props {
  children?: ReactNode
  overlay?: ReactNode
}

export function Scene({ children, overlay }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const api = useViewport()
  const { viewport, setViewport } = api
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [centered, setCentered] = useState(false)
  const { cursorMode } = useCanvasEvents(svgRef, api)
  const mode = useAppSelector(selectInteractionMode)
  const sceneValue = useMemo<SceneContextValue>(() => ({ ...api, svgRef }), [api])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const measure = () => {
      const rect = svg.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(svg)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (centered || size.width === 0 || size.height === 0) return
    setViewport({ zoom: viewport.zoom, panX: size.width / 2, panY: size.height / 2 })
    setCentered(true)
  }, [centered, size, viewport.zoom, setViewport])

  const drawing = mode === 'draw'
  const cursorClass = cursorMode ? styles[cursorMode] : drawing ? styles.drawing : ''

  return (
    <ViewportContext.Provider value={sceneValue}>
      <div className={styles.wrapper}>
        <svg
          ref={svgRef}
          tabIndex={0}
          className={[styles.svg, cursorClass].filter(Boolean).join(' ')}
          width="100%"
          height="100%"
        >
          <Grid viewport={viewport} width={size.width} height={size.height} />
          <g transform={`translate(${viewport.panX} ${viewport.panY}) scale(${viewport.zoom})`}>
            {children}
          </g>
          {overlay}
        </svg>
        <ScaleBar zoom={viewport.zoom} />
      </div>
    </ViewportContext.Provider>
  )
}
