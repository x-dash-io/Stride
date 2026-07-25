'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (type: Toast['type'], message: string) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => dismissToast(id), 5000)
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white min-w-[280px] animate-slide-in ${
              toast.type === 'success' ? 'bg-green-600' :
              toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}