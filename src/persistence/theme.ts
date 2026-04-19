export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

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

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme !== 'system') return theme
  if (typeof matchMedia !== 'function') return 'light'
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.setAttribute('data-theme', resolved)
}
