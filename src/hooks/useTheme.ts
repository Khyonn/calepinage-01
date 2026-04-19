import { useCallback, useState } from 'react'
import { applyTheme, readTheme, writeTheme, type Theme } from '@/persistence/theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => readTheme())

  const setTheme = useCallback((next: Theme) => {
    writeTheme(next)
    applyTheme(next)
    setThemeState(next)
  }, [])

  return { theme, setTheme }
}
