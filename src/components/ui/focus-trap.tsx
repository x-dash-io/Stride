'use client'

import { useEffect, useRef, type ReactNode } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function FocusTrap({ children, onEscape }: { children: ReactNode; onEscape?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<Element | null>(null)
  const onEscapeRef = useRef(onEscape)

  useEffect(() => {
    onEscapeRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    restoreFocusRef.current = document.activeElement

    const container = containerRef.current
    if (!container) return

    const getFocusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))

    getFocusables()[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscapeRef.current?.()
        return
      }
      if (e.key !== 'Tab') return

      const focusables = getFocusables()
      if (focusables.length === 0) {
        e.preventDefault()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      const restoreTarget = restoreFocusRef.current
      if (restoreTarget instanceof HTMLElement) restoreTarget.focus()
    }
  }, [])

  return (
    <div className="contents" ref={containerRef}>
      {children}
    </div>
  )
}
