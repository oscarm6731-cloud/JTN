export type Category =
  | 'politics'
  | 'sports'
  | 'world'
  | 'business'
  | 'tech'
  | 'entertainment'
  | 'general'

export interface Article {
  id: string
  title: string
  summary: string
  key_points: string[]
  url: string
  image_url: string | null
  source_name: string
  source_url: string
  category: Category
  published_at: string
  created_at: string
  is_featured: boolean
}

export interface Subscriber {
  id: string
  email: string | null
  phone: string | null
  confirmed: boolean
  created_at: string
  preferences: Category[]
}

export interface NewsAPIArticle {
  title: string
  description: string | null
  content: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  source: { id: string | null; name: string }
  author: string | null
}

export interface GuardianArticle {
  id: string
  webTitle: string
  webUrl: string
  webPublicationDate: string
  sectionName: string
  fields?: {
    bodyText?: string
    thumbnail?: string
    trailText?: string
  }
}

export interface NYTArticle {
  uri: string
  title: string
  abstract: string
  url: string
  published_date: string
  section: string
  multimedia: Array<{ url: string; format: string }>
  source: string
}

export interface RawArticle {
  title: string
  body: string
  url: string
  image_url: string | null
  source_name: string
  source_url: string
  published_at: string
}

export type NewsletterFormat = 'email' | 'sms'
