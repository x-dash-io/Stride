'use client'

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  position?: 'right' | 'left'
  size?: 'sm' | 'md' | 'lg'
  showCloseButton?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'sm',
  showCloseButton = true,
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const positionClass = position === 'right' ? 'right-0' : 'left-0'

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title || 'Drawer'}>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'fixed top-0 h-full w-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-200',
          positionClass,
          sizeClasses[size]
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
            {title && <h2 className="font-semibold text-base">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
