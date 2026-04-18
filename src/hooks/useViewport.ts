import { useSelector, useDispatch } from 'react-redux'
import { selectViewport } from '@/store/selectors'
import { uiActions } from '@/store/uiSlice'
import type { AppDispatch } from '@/store/types'
import type { Viewport } from '@/core/types'

export function useViewport() {
  const dispatch = useDispatch<AppDispatch>()
  const viewport = useSelector(selectViewport)

  function update(next: Viewport) {
    dispatch(uiActions.setViewport(next))
  }

  return { viewport, update }
}
