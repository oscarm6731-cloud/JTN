import Groq from 'groq-sdk'
import type { Category, RawArticle } from '@/types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const NEUTRAL_SYSTEM_PROMPT = `You are a professional news editor specializing in neutral, fact-based journalism.
Summarize news articles strictly based on verifiable facts.
Do not include opinions, speculation, emotionally charged language, political bias, or unverified claims.
Use clear, concise, professional language accessible to a general audience.`

export interface SummarizedArticle {
  headline: string
  summary: string
  key_points: string[]
  category: Category
}

export async function summarizeArticle(article: RawArticle): Promise<SummarizedArticle> {
  const prompt = `Analyze this news article and respond with valid JSON only (no markdown, no extra text).

Article Title: ${article.title}
Article Source: ${article.source_name}
Article Body: ${article.body.slice(0, 3000)}

Return this exact JSON structure:
{
  "headline": "A neutral, factual headline (max 12 words)",
  "summary": "A neutral 2-3 sentence summary strictly based on facts from the article",
  "key_points": ["Key fact 1", "Key fact 2", "Key fact 3"],
  "category": "one of: politics, sports, world, business, tech, entertainment, general"
}`

  const completion = await groq.chat.completions.create({
    model: 'llama3-70b-8192',
    messages: [
      { role: 'system', content: NEUTRAL_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 512,
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'
  try {
    const parsed = JSON.parse(raw) as SummarizedArticle
    // Validate category
    const validCategories: Category[] = ['politics', 'sports', 'world', 'business', 'tech', 'entertainment', 'general']
    if (!validCategories.includes(parsed.category)) parsed.category = 'general'
    return parsed
  } catch {
    // Fallback if JSON parse fails
    return {
      headline: article.title,
      summary: article.body.slice(0, 300),
      key_points: [],
      category: 'general',
    }
  }
}

export async function generateDigestIntro(topStories: string[]): Promise<string> {
  const prompt = `Write a brief, neutral 2-sentence introduction for today's news digest.
Top stories today: ${topStories.slice(0, 5).join('; ')}
Return only the introduction text, no formatting.`

  const completion = await groq.chat.completions.create({
    model: 'llama3-70b-8192',
    messages: [
      { role: 'system', content: NEUTRAL_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 150,
  })

  return completion.choices[0]?.message?.content ?? "Here is today's top news digest."
}
