import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generateDigestIntro } from '@/lib/groq'
import { sendNewsletterEmail } from '@/lib/email'
import { sendNewsletterSMS } from '@/lib/twilio'
import { format } from 'date-fns'
import type { Article, Subscriber } from '@/types'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = createServiceClient()
    const date = format(new Date(), 'MMMM d, yyyy')

    // Get today's top articles (one per category + overall top)
    const { data: articles, error: artErr } = await db
      .from('articles')
      .select('*')
      .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('published_at', { ascending: false })
      .limit(20)

    if (artErr || !articles?.length) {
      return NextResponse.json({ message: 'No articles for today', sent: 0 })
    }

    const topArticles = articles as Article[]
    const intro = await generateDigestIntro(topArticles.map((a) => a.title))

    // Get confirmed subscribers
    const { data: subscribers, error: subErr } = await db
      .from('subscribers')
      .select('*')
      .eq('confirmed', true)

    if (subErr || !subscribers?.length) {
      return NextResponse.json({ message: 'No confirmed subscribers', sent: 0 })
    }

    let emailsSent = 0
    let smsSent = 0

    // Process subscribers in batches of 10
    const subList = subscribers as Subscriber[]
    for (let i = 0; i < subList.length; i += 10) {
      const batch = subList.slice(i, i + 10)
      await Promise.allSettled(
        batch.map(async (sub) => {
          if (sub.email) {
            const ok = await sendNewsletterEmail(sub.email, topArticles, intro, date)
            if (ok) emailsSent++
          }
          if (sub.phone) {
            const ok = await sendNewsletterSMS(sub.phone, topArticles, date)
            if (ok) smsSent++
          }
        })
      )
      // Rate-limit pause between batches
      if (i + 10 < subList.length) {
        await new Promise((r) => setTimeout(r, 500))
      }
    }

    // Log the newsletter send
    await db.from('newsletter_logs').insert({
      sent_at: new Date().toISOString(),
      articles_count: topArticles.length,
      emails_sent: emailsSent,
      sms_sent: smsSent,
    })

    return NextResponse.json({
      message: 'Newsletter sent',
      emailsSent,
      smsSent,
      articleCount: topArticles.length,
    })
  } catch (err) {
    console.error('send-newsletter error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
