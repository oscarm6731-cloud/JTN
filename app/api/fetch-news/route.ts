import { NextRequest, NextResponse } from 'next/server'
import { fetchAllNews } from '@/lib/newsapi'
import { summarizeArticle } from '@/lib/groq'
import { createServiceClient } from '@/lib/supabase'
import { cacheGet, cacheSet } from '@/lib/cache'
import type { Article, RawArticle } from '@/types'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  // Protect with cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawArticles: RawArticle[] = await fetchAllNews()

    if (rawArticles.length === 0) {
      return NextResponse.json({ message: 'No articles fetched', count: 0 })
    }

    const db = createServiceClient()
    let saved = 0

    // Process in batches of 5 to avoid rate limits
    for (let i = 0; i < Math.min(rawArticles.length, 50); i += 5) {
      const batch = rawArticles.slice(i, i + 5)

      const summarized = await Promise.allSettled(
        batch.map((article) => summarizeArticle(article))
      )

      const toInsert = batch
        .map((raw, idx) => {
          const result = summarized[idx]
          if (result.status === 'rejected') return null
          const ai = result.value
          return {
            title: ai.headline || raw.title,
            summary: ai.summary,
            key_points: ai.key_points,
            url: raw.url,
            image_url: raw.image_url,
            source_name: raw.source_name,
            source_url: raw.source_url,
            category: ai.category,
            published_at: raw.published_at,
            is_featured: false,
          }
        })
        .filter(Boolean)

      if (toInsert.length > 0) {
        const { error } = await db
          .from('articles')
          .upsert(toInsert as Omit<Article, 'id' | 'created_at'>[], {
            onConflict: 'url',
            ignoreDuplicates: true,
          })
        if (!error) saved += toInsert.length
      }

      // Small delay between batches to respect Groq rate limits
      if (i + 5 < rawArticles.length) {
        await new Promise((r) => setTimeout(r, 1000))
      }
    }

    // Bust cache after fetch
    cacheSet('articles_general', null, 1)

    return NextResponse.json({ message: 'News fetched and saved', count: saved })
  } catch (err) {
    console.error('fetch-news error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Public GET — returns cached articles for the UI
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') ?? 'all'
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50)
  const search = searchParams.get('search') ?? ''

  const cacheKey = `articles_${category}_${limit}_${search}`
  const cached = cacheGet<Article[]>(cacheKey)
  if (cached) return NextResponse.json({ articles: cached, cached: true })

  try {
    const db = createServiceClient()
    let query = db
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (category !== 'all') query = query.eq('category', category)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (error) throw error

    cacheSet(cacheKey, data, 900) // 15-min cache
    return NextResponse.json({ articles: data ?? [] })
  } catch (err) {
    console.error('GET articles error:', err)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}
