import { Suspense } from 'react'
import { createServiceClient } from '@/lib/supabase'
import NewsCard from '@/components/NewsCard'
import CategoryFilter from '@/components/CategoryFilter'
import SubscribeForm from '@/components/SubscribeForm'
import type { Article } from '@/types'

export const revalidate = 900 // 15 minutes

interface HomeProps {
  searchParams: { search?: string; category?: string }
}

async function getArticles(search?: string): Promise<Article[]> {
  try {
    const db = createServiceClient()
    let query = db
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(30)

    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as Article[]
  } catch (err) {
    console.error('Failed to load articles:', err)
    return []
  }
}

export default async function HomePage({ searchParams }: HomeProps) {
  const search = searchParams.search
  const articles = await getArticles(search)

  const featured = articles.slice(0, 2)
  const rest = articles.slice(2)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">
          {search ? `Results for "${search}"` : "Today's Top Headlines"}
        </h1>
        <p className="text-gray-500 text-sm">
          Neutral, AI-summarized news from multiple verified sources
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-8">
        <CategoryFilter active="all" />
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-lg">
            {search ? 'No results found.' : 'No articles yet. Check back soon.'}
          </p>
        </div>
      ) : (
        <>
          {/* Featured 2-col grid */}
          {featured.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-4">Featured</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featured.map((a) => (
                  <NewsCard key={a.id} article={a} variant="featured" />
                ))}
              </div>
            </section>
          )}

          {/* Main grid */}
          {rest.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">More Headlines</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((a) => (
                  <NewsCard key={a.id} article={a} variant="default" />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Subscribe section */}
      <section id="subscribe" className="mt-16">
        <SubscribeForm />
      </section>
    </div>
  )
}
