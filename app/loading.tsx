
'use client'

import { useMinimumLoadingTime } from './hooks/useMinimumLoadingTime'

export default function Loading() {
  const isLoading = useMinimumLoadingTime(1500) // 1.5 seconds minimum loading time

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
}
