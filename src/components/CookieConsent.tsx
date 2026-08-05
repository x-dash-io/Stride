'use client'

import { useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const CONSENT_KEY = 'stride-cookie-consent'

type ConsentChoice = 'accepted' | 'essential' | null

function readConsent(): ConsentChoice {
  try {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored === 'accepted' || stored === 'essential') return stored
  } catch {
    return 'essential'
  }
  return null
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  window.addEventListener('stride-consent', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('stride-consent', callback)
  }
}

export function CookieConsent() {
  const choice = useSyncExternalStore(subscribe, readConsent, () => null)

  if (choice !== null) return null

  const choose = (value: Exclude<ConsentChoice, null>) => {
    try {
      localStorage.setItem(CONSENT_KEY, value)
    } catch {
      // localStorage unavailable — dismiss for the session only
    }
    window.dispatchEvent(new Event('stride-consent'))
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      suppressHydrationWarning
      className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-3xl rounded-2xl border border-border/60 bg-background/95 p-5 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Cookie consent</p>
          <p className="mt-1">
            STRIDE uses essential cookies to keep your session, cart and CSRF protections working. We do not set
            third-party marketing cookies. Read our{' '}
            <Link href="/cookie-policy" className="underline underline-offset-2 hover:text-foreground">
              cookie policy
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
              privacy policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => choose('essential')}>
            Essential only
          </Button>
          <Button size="sm" onClick={() => choose('accepted')}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  )
}
