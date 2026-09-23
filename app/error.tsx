'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-3xl mb-4 shadow-sm">
        ⚠️
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-sm text-gray-600 max-w-md mb-6 leading-relaxed">
        An error occurred while loading this page. This often happens if the database connection was paused due to inactivity.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90 shadow-sm"
          style={{ backgroundColor: '#C17A7A' }}
        >
          Try Again
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}
