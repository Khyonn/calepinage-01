import { useMemo } from 'react'
import { useAppSelector } from '@/hooks/redux'
import { makeSelectRowGeometry } from '@/store/selectors'

export function useRowGeometry(roomId: string, rowId: string) {
  const selector = useMemo(makeSelectRowGeometry, [])
  return useAppSelector(s => selector(s, { roomId, rowId }))
}
