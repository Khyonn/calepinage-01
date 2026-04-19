import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/store'
import type { AppState } from '@/store/types'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<AppState>()
