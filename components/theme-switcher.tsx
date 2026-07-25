'use client'

import { useTheme } from '@/lib/hooks/use-theme'
import { Moon, Sun, Palette } from 'lucide-react'

export function ThemeSwitcher() {
  const { theme, setTheme, mounted } = useTheme()

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded transition-colors ${
          theme === 'light'
            ? 'bg-card text-primary shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Light theme"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('slate')}
        className={`p-2 rounded transition-colors ${
          theme === 'slate'
            ? 'bg-card text-primary shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Slate theme"
      >
        <Palette className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded transition-colors ${
          theme === 'dark'
            ? 'bg-card text-primary shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Dark theme"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  )
}
