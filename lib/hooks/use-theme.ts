'use client'

import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'slate'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage.getItem('theme') as Theme | null
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (storedTheme) {
      setTheme(storedTheme)
      applyTheme(storedTheme)
    } else if (systemDark) {
      setTheme('dark')
      applyTheme('dark')
    } else {
      setTheme('light')
      applyTheme('light')
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement
    html.classList.remove('dark', 'light', 'slate')
    html.classList.add(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'slate', 'dark']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  const setSpecificTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  return {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    mounted,
  }
}
