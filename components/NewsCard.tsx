import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Article, Category } from '@/types'

const CATEGORY_STYLES: Record<Category, string> = {
  politics:      'bg-red-100 text-red-700',
  sports:        'bg-green-100 text-green-700',
  world:         'bg-blue-100 text-blue-700',
  business:      'bg-amber-100 text-amber-700',
  tech:          'bg-violet-100 text-violet-700',
  entertainment: 'bg-pink-100 text-pink-700',
  general:       'bg-gray-100 text-gray-600',
}

interface NewsCardProps {
  article: Article
  variant?: 'default' | 'featured' | 'compact'
}

export default function NewsCard({ article, variant = 'default' }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
  const badgeClass = CATEGORY_STYLES[article.category] ?? CATEGORY_STYLES.general

  if (variant === 'compact') {
    return (
      <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
        {article.image_url && (
          <div className="relative w-20 h-16 shrink-0 rounded overflow-hidden bg-gray-100">
            <Image src={article.image_url} alt={article.title} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${badgeClass}`}>
            {article.category}
          </span>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
            {article.title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{article.source_name} · {timeAgo}</p>
        </div>
      </div>
    )
  }

  if (variant === 'featured') {
    return (
      <article className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow">
        <div className="relative h-64 bg-gray-200">
          {article.image_url ? (
            <Image src={article.image_url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${badgeClass}`}>
              {article.category}
            </span>
            <h2 className="text-white text-xl font-bold leading-snug line-clamp-2">
              {article.title}
            </h2>
            <p className="text-gray-300 text-xs mt-1">{article.source_name} · {timeAgo}</p>
          </div>
        </div>
        <div className="p-5">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{article.summary}</p>
          {article.key_points.length > 0 && (
            <ul className="mt-3 space-y-1">
              {article.key_points.slice(0, 3).map((kp, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="text-brand-500 font-bold mt-0.5">•</span>
                  {kp}
                </li>
              ))}
            </ul>
          )}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-4 text-brand-500 hover:text-brand-700 text-sm font-semibold transition"
          >
            Read full article
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </article>
    )
  }

  // Default card
  return (
    <article className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
      {article.image_url && (
        <div className="relative h-44 bg-gray-100 overflow-hidden">
          <Image src={article.image_url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
            {article.category}
          </span>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>
        <h2 className="font-bold text-gray-900 leading-snug text-base line-clamp-2 mb-2">
          {article.title}
        </h2>
        <p className="text-gray-500 text-sm line-clamp-2 flex-1">{article.summary}</p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">{article.source_name}</span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-500 hover:text-brand-700 text-xs font-semibold transition"
          >
            Read more →
          </a>
        </div>
      </div>
    </article>
  )
}
