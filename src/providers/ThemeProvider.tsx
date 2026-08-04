'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider scriptProps={{ id: 'stride-theme-script' }} {...props}>
      {children}
    </NextThemesProvider>
  )
}
