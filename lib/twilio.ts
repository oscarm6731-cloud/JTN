import type { Article } from '@/types'

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://example.com'

function buildSMSBody(articles: Article[], date: string): string {
  const top = articles.slice(0, 5)
  const lines = top.map((a, i) => `${i + 1}. ${a.title}`)
  return `JTN Daily Digest — ${date}\n\n${lines.join('\n')}\n\nFull digest: ${APP_URL}/daily-digest`
}

export async function sendSMS(to: string, body: string): Promise<boolean> {
  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM_NUMBER) {
    console.warn('Twilio credentials not set — skipping SMS')
    return false
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`
  const auth = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64')

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: FROM_NUMBER, Body: body }).toString(),
    })
    return res.ok
  } catch (err) {
    console.error('SMS send error:', err)
    return false
  }
}

export async function sendNewsletterSMS(to: string, articles: Article[], date: string): Promise<boolean> {
  const body = buildSMSBody(articles, date)
  return sendSMS(to, body)
}

export async function sendConfirmationSMS(to: string, token: string): Promise<boolean> {
  const confirmUrl = `${APP_URL}/api/confirm?token=${token}&type=sms`
  const body = `JTN: Reply to confirm your subscription or click: ${confirmUrl}`
  return sendSMS(to, body)
}
