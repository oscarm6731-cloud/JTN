'use client'

import Link from 'next/link'
import { useState } from 'react'
import SearchBar from './SearchBar'

const CATEGORIES = [
  { label: 'Top News', slug: 'all' },
  { label: 'Politics', slug: 'politics' },
  { label: 'World', slug: 'world' },
  { label: 'Business', slug: 'business' },
  { label: 'Tech', slug: 'tech' },
  { label: 'Sports', slug: 'sports' },
  { label: 'Entertainment', slug: 'entertainment' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-brand-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-extrabold tracking-tight text-white">JTN</span>
            <span className="hidden sm:block text-xs text-blue-300 font-medium mt-1">
              Just The News
            </span>
          </Link>

          {/* Search — desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Daily Digest link + hamburger */}
          <div className="flex items-center gap-4">
            <Link
              href="/daily-digest"
              className="hidden sm:inline-flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
            >
              Daily Digest
            </Link>
            <button
              className="md:hidden text-white focus:outline-none"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Category nav */}
        <nav className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.slug === 'all' ? '/' : `/category/${cat.slug}`}
              className="text-sm text-blue-200 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-md transition whitespace-nowrap"
            >
              {cat.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-brand-900 border-t border-white/10 px-4 pb-4 space-y-3">
          <SearchBar />
          <div className="flex flex-wrap gap-2 pt-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.slug === 'all' ? '/' : `/category/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-blue-200 hover:text-white bg-white/10 px-3 py-1 rounded-full"
              >
                {cat.label}
              </Link>
            ))}
          </div>
          <Link
            href="/daily-digest"
            onClick={() => setMenuOpen(false)}
            className="block text-center bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-full"
          >
            Daily Digest
          </Link>
        </div>
      )}
    </header>
  )
}
