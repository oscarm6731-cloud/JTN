'use client'

import { useState } from 'react'

type Tab = 'email' | 'sms'

export default function SubscribeForm() {
  const [tab, setTab] = useState<Tab>('email')
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    setStatus('loading')
    setMessage('')

    try {
      const body = tab === 'email' ? { email: value } : { phone: value }
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json() as { message?: string; error?: string }
      if (res.ok) {
        setStatus('success')
        setMessage(data.message ?? 'Subscribed!')
        setValue('')
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
    <div className="bg-gradient-to-br from-brand-900 to-brand-700 rounded-2xl p-8 text-white">
      <h2 className="text-2xl font-bold mb-1">Get the Daily Digest</h2>
      <p className="text-blue-200 text-sm mb-6">
        Neutral, AI-summarized news delivered every morning at 5 AM Pacific.
      </p>

      {/* Tab toggle */}
      <div className="flex bg-white/10 rounded-full p-1 mb-5 w-fit">
        {(['email', 'sms'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setValue(''); setStatus('idle') }}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition ${
              tab === t ? 'bg-white text-brand-900' : 'text-blue-200 hover:text-white'
            }`}
          >
            {t === 'email' ? 'Email' : 'SMS'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type={tab === 'email' ? 'email' : 'tel'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={tab === 'email' ? 'your@email.com' : '+12125551234'}
          required
          className="flex-1 bg-white/15 border border-white/20 rounded-full px-5 py-2.5 text-white placeholder-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-white text-brand-900 font-bold text-sm px-6 py-2.5 rounded-full hover:bg-blue-50 transition disabled:opacity-60"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {message && (
        <p className={`mt-3 text-sm font-medium ${status === 'success' ? 'text-green-300' : 'text-red-300'}`}>
          {message}
        </p>
      )}

      <p className="mt-4 text-xs text-blue-300">
        Free forever. No spam. Unsubscribe anytime.
      </p>
    </div>
  )
}
