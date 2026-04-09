'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UnsubscribePage() {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
      const data = await res.json() as { message?: string; error?: string }
      if (res.ok) {
        setStatus('success')
        setMessage(data.message ?? "You've been unsubscribed.")
      } else {
        setStatus('error')
        setMessage(data.error ?? 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribe</h1>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email or phone number to unsubscribe from JTN Daily Digest.
        </p>

        {status === 'success' ? (
          <div className="text-center">
            <p className="text-green-600 font-medium mb-4">{message}</p>
            <Link href="/" className="text-brand-500 hover:underline text-sm">
              Back to homepage
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="email@example.com or +12125551234"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {message && (
              <p className="text-red-500 text-sm">{message}</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gray-900 text-white font-semibold py-2.5 rounded-xl hover:bg-gray-700 transition disabled:opacity-60"
            >
              {status === 'loading' ? 'Processing...' : 'Unsubscribe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
