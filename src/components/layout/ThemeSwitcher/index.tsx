import { RadioGroup } from '@/components/ui/RadioGroup'
import { useTheme } from '@/hooks/useTheme'
import type { Theme } from '@/persistence/theme'
import styles from './ThemeSwitcher.module.css'

const OPTIONS = [
  { value: 'light',  label: 'Clair'   },
  { value: 'dark',   label: 'Sombre'  },
  { value: 'system', label: 'Système' },
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
