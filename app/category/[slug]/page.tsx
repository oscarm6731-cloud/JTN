import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase'
import NewsCard from '@/components/NewsCard'
import CategoryFilter from '@/components/CategoryFilter'
import SubscribeForm from '@/components/SubscribeForm'
import type { Article, Category } from '@/types'

export const revalidate = 900

const VALID_CATEGORIES: Category[] = ['politics', 'sports', 'world', 'business', 'tech', 'entertainment']

const CATEGORY_LABELS: Record<Category, string> = {
  politics:      'Politics',
  sports:        'Sports',
  world:         'World News',
  business:      'Business',
  tech:          'Technology',
  entertainment: 'Entertainment',
  general:       'General',
}

interface CategoryPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const label = CATEGORY_LABELS[params.slug as Category] ?? params.slug
  return {
    title: `${label} News`,
    description: `Latest ${label} headlines, AI-summarized and unbiased.`,
  }
}

async function getCategoryArticles(category: Category): Promise<Article[]> {
  try {
    const db = createServiceClient()
    const { data, error } = await db
      .from('articles')
      .select('*')
      .eq('category', category)
      .order('published_at', { ascending: false })
      .limit(24)

    if (error) throw error
    return (data ?? []) as Article[]
  } catch {
    return []
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const slug = params.slug as Category

  if (!VALID_CATEGORIES.includes(slug)) notFound()

  const articles = await getCategoryArticles(slug)
  const label = CATEGORY_LABELS[slug]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">{label}</h1>
        <p className="text-gray-500 text-sm">
          Latest {label.toLowerCase()} headlines — neutral and fact-based
        </p>
      </div>

      <div className="mb-8">
        <CategoryFilter active={slug} />
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-gray-400 text-lg">No {label} articles yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {articles.map((a) => (
            <NewsCard key={a.id} article={a} variant="default" />
          ))}
        </div>
      )}

      <section id="subscribe">
        <SubscribeForm />
      </section>
    </div>
  )
}
