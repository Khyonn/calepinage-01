import type { Point } from '@/core/types'

export interface PlanTransform {
  planX: number
  planY: number
  rotationDeg: number
  imageScale: number
  naturalWidth: number
  naturalHeight: number
}

export function imagePointToWorld(p: Point, t: PlanTransform): Point {
  const cx = (t.naturalWidth * t.imageScale) / 2
  const cy = (t.naturalHeight * t.imageScale) / 2
  const sx = p.x * t.imageScale
  const sy = p.y * t.imageScale
  const rad = (t.rotationDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = sx - cx
  const dy = sy - cy
  const rx = cos * dx - sin * dy + cx
  const ry = sin * dx + cos * dy + cy
  return { x: rx + t.planX, y: ry + t.planY }
}

export function worldPointToImage(world: Point, t: PlanTransform): Point {
  const cx = (t.naturalWidth * t.imageScale) / 2
  const cy = (t.naturalHeight * t.imageScale) / 2
  const rad = (t.rotationDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const wx = world.x - t.planX - cx
  const wy = world.y - t.planY - cy
  const sx = cos * wx + sin * wy + cx
  const sy = -sin * wx + cos * wy + cy
  const scale = t.imageScale || 1
  return { x: sx / scale, y: sy / scale }
}
