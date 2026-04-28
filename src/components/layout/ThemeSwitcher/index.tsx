import { Monitor, Moon, Sun } from 'lucide-react'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { useTheme } from '@/hooks/useTheme'
import type { Theme } from '@/persistence/theme'
import styles from './ThemeSwitcher.module.css'

const OPTIONS = [
  { value: 'light',  label: <><Sun size={14} /><span>Clair</span></> },
  { value: 'dark',   label: <><Moon size={14} /><span>Sombre</span></> },
  { value: 'system', label: <><Monitor size={14} /><span>Système</span></> },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <div className={styles.wrapper}>
      <RadioGroup
        label="Thème"
        options={OPTIONS}
        value={theme}
        onChange={v => setTheme(v as Theme)}
      />
    </div>
  )
}
