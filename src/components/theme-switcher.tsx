'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

const themes = [
  { value: 'light', icon: Sun, label: 'Light mode' },
  { value: 'dark', icon: Moon, label: 'Dark mode' },
  { value: 'system', icon: Monitor, label: 'System preference' },
] as const

export function ThemeSwitcher() {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const { theme, setTheme } = useTheme()

  if (!mounted) {
    return <div className="h-9 w-24" aria-hidden="true" />
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-0.5" role="radiogroup" aria-label="Theme selector">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'relative inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-all duration-200',
            theme === value
              ? 'bg-accent text-accent-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}
