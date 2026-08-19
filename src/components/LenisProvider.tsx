'use client'

import { ReactLenis } from 'lenis/react'
import { ReactNode } from 'react'

export function LenisProvider({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  // Lenis' "root" smooth-scroll works by applying a CSS transform to a
  // wrapper around the page. Any ancestor transform creates a new
  // containing block for descendants, which breaks `position: fixed`
  // elements (they start scrolling with the page instead of staying
  // pinned to the viewport). The admin sidebar relies on position:fixed,
  // so Lenis must be skipped entirely on admin routes rather than just
  // configured differently.
  if (!enabled) {
    return <>{children}</>
  }

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}