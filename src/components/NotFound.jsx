import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="text-8xl font-black text-purple-100 select-none tracking-tighter leading-none">404</div>
      <h1 className="text-2xl font-semibold text-gray-800 mt-4">Page not found</h1>
      <p className="text-gray-500 mt-2 max-w-sm text-sm">
        The tool or page you're looking for doesn't exist yet. But we're always adding more!
      </p>
      <Link
        to="/"
        className="mt-6 bg-[#7F77DD] text-white rounded-xl px-6 py-3 text-sm font-medium hover:opacity-90 transition inline-block shadow-sm cursor-pointer"
      >
        ← Back to Toolra
      </Link>
      <div className="mt-8 text-sm text-gray-400">
        Looking for a specific tool?{' '}
        <Link to="/tools" className="text-[#7F77DD] hover:underline font-medium cursor-pointer">Browse all tools →</Link>
      </div>
    </div>
  )
}
