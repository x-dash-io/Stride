'use client'

import { useState, useCallback } from 'react'

export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState)

  const startLoading = useCallback(() => {
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const withLoading = useCallback(
    async <T,>(callback: () => Promise<T>): Promise<T | null> => {
      startLoading()
      try {
        const result = await callback()
        return result
      } finally {
        stopLoading()
      }
    },
    [startLoading, stopLoading]
  )

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  }
}
