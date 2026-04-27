import { useCallback, useState } from 'react'
import type { CloneOptions } from '@/core/cloneProject'

export const INITIAL: CloneOptions = {
  catalog: true,
  poseParams: true,
  backgroundPlan: false,
  rooms: true,
  rows: true,
}

function applyDependencies(next: CloneOptions): CloneOptions {
  const enforced: CloneOptions = { ...next }
  if (enforced.rows) {
    enforced.rooms = true
    enforced.catalog = true
  }
  if (!enforced.rooms) enforced.rows = false
  if (!enforced.catalog) enforced.rows = false
  return enforced
}

export function useCloneOptions() {
  const [options, setOptions] = useState<CloneOptions>(INITIAL)

  const setKey = useCallback((key: keyof CloneOptions, value: boolean) => {
    setOptions(prev => applyDependencies({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => setOptions(INITIAL), [])

  const lockedByRows = options.rows
  const locks = {
    catalog: lockedByRows,
    rooms: lockedByRows,
  }

  return { options, setKey, reset, locks }
}
