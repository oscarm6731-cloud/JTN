import { NextRequest, NextResponse } from 'next/server'

// This endpoint is called by Vercel Cron at 5:00 AM Pacific (13:00 UTC)
// It orchestrates: fetch news → summarize → send newsletter
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CRON_SECRET}`,
  }

  try {
    // Step 1: Fetch and summarize news
    console.log('[cron] Fetching news...')
    const fetchRes = await fetch(`${base}/api/fetch-news`, { method: 'POST', headers })
    const fetchData = await fetchRes.json() as { count?: number; error?: string }
    console.log('[cron] fetch-news:', fetchData)

    if (!fetchRes.ok) {
      return NextResponse.json({ error: 'fetch-news failed', detail: fetchData }, { status: 500 })
    }

    // Step 2: Send newsletter
    console.log('[cron] Sending newsletter...')
    const sendRes = await fetch(`${base}/api/send-newsletter`, { method: 'POST', headers })
    const sendData = await sendRes.json() as Record<string, unknown>
    console.log('[cron] send-newsletter:', sendData)

    return NextResponse.json({
      success: true,
      fetchNews: fetchData,
      newsletter: sendData,
    })
  } catch (err) {
    console.error('[cron] error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
