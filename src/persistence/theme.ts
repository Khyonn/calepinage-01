export type Theme = 'light' | 'dark' | 'system'

const KEY = 'calepinage.theme'
const DEFAULT: Theme = 'system'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function readTheme(): Theme {
  try {
    const raw = localStorage.getItem(KEY)
    return isTheme(raw) ? raw : DEFAULT
  } catch {
    return DEFAULT
  }
}

export function writeTheme(theme: Theme): void {
  try { localStorage.setItem(KEY, theme) } catch { /* ignore */ }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', theme)
  }
}
