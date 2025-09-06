
'use client'

import { useState, useEffect } from 'react'

export function useMinimumLoadingTime(minimumLoadingTimeMs: number) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, minimumLoadingTimeMs)

    return () => clearTimeout(timer)
  }, [minimumLoadingTimeMs])

  return isLoading
}
