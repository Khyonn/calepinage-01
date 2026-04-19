import { useCallback, useEffect, useState } from 'react'
import { applyTheme, readTheme, resolveTheme, writeTheme, type Theme } from '@/persistence/theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => readTheme())

  useEffect(() => {
    if (theme !== 'system' || typeof matchMedia !== 'function') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme(resolveTheme('system'))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    writeTheme(next)
    applyTheme(resolveTheme(next))
    setThemeState(next)
  }, [])

  return { theme, setTheme }
}
