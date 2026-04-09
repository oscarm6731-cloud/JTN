import type { Metadata } from 'next'
import { format } from 'date-fns'
import { createServiceClient } from '@/lib/supabase'
import NewsCard from '@/components/NewsCard'
import SubscribeForm from '@/components/SubscribeForm'
import type { Article, Category } from '@/types'

export const metadata: Metadata = {
  title: "Daily Digest",
  description: "Today's top news stories across all categories, AI-summarized and unbiased.",
}

export const revalidate = 900

const CATEGORY_ORDER: Category[] = ['world', 'politics', 'business', 'tech', 'sports', 'entertainment', 'general']

const CATEGORY_LABELS: Record<Category, string> = {
  politics:      'Politics',
  sports:        'Sports',
  world:         'World',
  business:      'Business',
  tech:          'Technology',
  entertainment: 'Entertainment',
  general:       'General',
}

async function getDailyDigest(): Promise<Map<Category, Article[]>> {
  try {
    const db = createServiceClient()
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data, error } = await db
      .from('articles')
      .select('*')
      .gte('published_at', since)
      .order('published_at', { ascending: false })
      .limit(60)

    if (error) throw error

    const byCategory = new Map<Category, Article[]>()
    for (const article of (data ?? []) as Article[]) {
      const cat = article.category
      if (!byCategory.has(cat)) byCategory.set(cat, [])
      byCategory.get(cat)!.push(article)
    }
    return byCategory
  } catch {
    return new Map()
  }
}

export default async function DailyDigestPage() {
  const digest = await getDailyDigest()
  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  const totalArticles = [...digest.values()].reduce((s, a) => s + a.length, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-900 to-brand-700 text-white rounded-2xl p-8 mb-10">
        <p className="text-blue-300 text-sm font-medium mb-1">{today}</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Daily Digest</h1>
        <p className="text-blue-200">
          {totalArticles > 0
            ? `${totalArticles} stories across ${digest.size} categories — neutral and fact-based`
            : 'Stories are refreshed every morning. Check back soon.'}
        </p>
      </div>

      {totalArticles === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-lg">
            Today's digest is being prepared. Check back at 5 AM Pacific.
          </p>
        </div>
      ) : (
        CATEGORY_ORDER.filter((cat) => digest.has(cat)).map((cat) => {
          const articles = digest.get(cat)!.slice(0, 4)
          return (
            <section key={cat} className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-bold text-gray-900">{CATEGORY_LABELS[cat]}</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {digest.get(cat)!.length} stories
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {articles.map((a, i) => (
                  <NewsCard key={a.id} article={a} variant={i === 0 ? 'featured' : 'default'} />
                ))}
              </div>
            </section>
          )
        })
      )}

      <section id="subscribe" className="mt-8">
        <SubscribeForm />
      </section>
    </div>
  )
}
