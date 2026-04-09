import type { NewsAPIArticle, GuardianArticle, NYTArticle, RawArticle } from '@/types'

const NEWS_API_KEY = process.env.NEWS_API_KEY
const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY
const NYT_API_KEY = process.env.NYT_API_KEY

// Simple in-memory deduplication via URL set
const seenUrls = new Set<string>()

function dedup(articles: RawArticle[]): RawArticle[] {
  return articles.filter((a) => {
    if (seenUrls.has(a.url)) return false
    seenUrls.add(a.url)
    return true
  })
}

// ─── NewsAPI.org ──────────────────────────────────────────────────────────────
export async function fetchFromNewsAPI(category = 'general', pageSize = 20): Promise<RawArticle[]> {
  if (!NEWS_API_KEY) return []
  const catMap: Record<string, string> = {
    politics: 'politics', sports: 'sports', world: 'world', business: 'business',
    tech: 'technology', entertainment: 'entertainment', general: 'general',
  }
  const newsCategory = catMap[category] ?? 'general'
  const url = `https://newsapi.org/v2/top-headlines?category=${newsCategory}&language=en&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json() as { articles?: NewsAPIArticle[] }
    return (data.articles ?? [])
      .filter((a) => a.title && a.url && a.title !== '[Removed]')
      .map((a) => ({
        title: a.title,
        body: [a.description, a.content].filter(Boolean).join('\n\n'),
        url: a.url,
        image_url: a.urlToImage,
        source_name: a.source.name,
        source_url: `https://${new URL(a.url).hostname}`,
        published_at: a.publishedAt,
      }))
  } catch {
    return []
  }
}

// ─── The Guardian ─────────────────────────────────────────────────────────────
export async function fetchFromGuardian(section = 'world', pageSize = 20): Promise<RawArticle[]> {
  if (!GUARDIAN_API_KEY) return []
  const url = `https://content.guardianapis.com/search?section=${section}&page-size=${pageSize}&show-fields=bodyText,thumbnail,trailText&api-key=${GUARDIAN_API_KEY}`

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json() as { response?: { results?: GuardianArticle[] } }
    return (data.response?.results ?? []).map((a) => ({
      title: a.webTitle,
      body: a.fields?.bodyText ?? a.fields?.trailText ?? '',
      url: a.webUrl,
      image_url: a.fields?.thumbnail ?? null,
      source_name: 'The Guardian',
      source_url: 'https://theguardian.com',
      published_at: a.webPublicationDate,
    }))
  } catch {
    return []
  }
}

// ─── New York Times ───────────────────────────────────────────────────────────
export async function fetchFromNYT(section = 'home'): Promise<RawArticle[]> {
  if (!NYT_API_KEY) return []
  const url = `https://api.nytimes.com/svc/topstories/v2/${section}.json?api-key=${NYT_API_KEY}`

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) return []
    const data = await res.json() as { results?: NYTArticle[] }
    return (data.results ?? [])
      .filter((a) => a.title && a.url)
      .map((a) => {
        const img = a.multimedia?.find((m) => m.format === 'threeByTwoSmallAt2X') ?? a.multimedia?.[0]
        return {
          title: a.title,
          body: a.abstract ?? '',
          url: a.url,
          image_url: img ? `https://www.nytimes.com/${img.url}` : null,
          source_name: 'The New York Times',
          source_url: 'https://nytimes.com',
          published_at: a.published_date,
        }
      })
  } catch {
    return []
  }
}

// ─── Aggregate all sources ────────────────────────────────────────────────────
export async function fetchAllNews(): Promise<RawArticle[]> {
  seenUrls.clear()

  const [newsApiGeneral, newsApiBusiness, newsApiSports, newsApiTech, newsApiEnt,
    guardianWorld, guardianPolitics, nytHome, nytPolitics, nytBusiness] = await Promise.all([
    fetchFromNewsAPI('general', 15),
    fetchFromNewsAPI('business', 10),
    fetchFromNewsAPI('sports', 10),
    fetchFromNewsAPI('tech', 10),
    fetchFromNewsAPI('entertainment', 10),
    fetchFromGuardian('world', 15),
    fetchFromGuardian('politics', 10),
    fetchFromNYT('home'),
    fetchFromNYT('politics'),
    fetchFromNYT('business'),
  ])

  const all = [
    ...newsApiGeneral, ...newsApiBusiness, ...newsApiSports, ...newsApiTech, ...newsApiEnt,
    ...guardianWorld, ...guardianPolitics, ...nytHome, ...nytPolitics, ...nytBusiness,
  ]

  return dedup(all)
}
