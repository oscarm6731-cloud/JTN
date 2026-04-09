import type { Article } from '@/types'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = `${process.env.EMAIL_FROM_NAME ?? 'JTN Daily Digest'} <${process.env.EMAIL_FROM ?? 'newsletter@example.com'}>`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://example.com'

function buildEmailHTML(articles: Article[], intro: string, date: string): string {
  const categoryColors: Record<string, string> = {
    politics: '#dc2626', sports: '#16a34a', world: '#2563eb',
    business: '#d97706', tech: '#7c3aed', entertainment: '#db2777', general: '#6b7280',
  }

  const articleRows = articles
    .slice(0, 15)
    .map(
      (a) => `
      <tr>
        <td style="padding: 20px 0; border-bottom: 1px solid #e5e7eb;">
          <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;color:#fff;background:${categoryColors[a.category] ?? '#6b7280'};text-transform:uppercase;margin-bottom:8px;">
            ${a.category}
          </span>
          <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111827;font-family:Georgia,serif;">${a.title}</h2>
          <p style="margin:0 0 10px;font-size:14px;color:#374151;line-height:1.6;">${a.summary}</p>
          <ul style="margin:0 0 10px;padding-left:20px;font-size:13px;color:#4b5563;">
            ${a.key_points.map((kp) => `<li style="margin-bottom:4px;">${kp}</li>`).join('')}
          </ul>
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            Source: ${a.source_name} &nbsp;|&nbsp;
            <a href="${a.url}" style="color:#3b5bdb;text-decoration:none;">Read full article →</a>
          </p>
        </td>
      </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:ui-sans-serif,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr><td style="background:#1e3a8a;padding:28px 32px;">
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">JTN Daily Digest</h1>
          <p style="margin:6px 0 0;color:#93c5fd;font-size:14px;">${date} &nbsp;|&nbsp; Neutral. Factual. Comprehensive.</p>
        </td></tr>
        <!-- Intro -->
        <tr><td style="padding:24px 32px;background:#eff6ff;border-bottom:2px solid #dbeafe;">
          <p style="margin:0;font-size:15px;color:#1e40af;line-height:1.6;">${intro}</p>
        </td></tr>
        <!-- Articles -->
        <tr><td style="padding:0 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${articleRows}
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 32px;background:#f3f4f6;text-align:center;">
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
            You're receiving this because you subscribed at <a href="${APP_URL}" style="color:#3b5bdb;">${APP_URL}</a>
          </p>
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            <a href="${APP_URL}/unsubscribe" style="color:#9ca3af;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendNewsletterEmail(
  to: string,
  articles: Article[],
  intro: string,
  date: string
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return false
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to,
        subject: `JTN Daily Digest — ${date}`,
        html: buildEmailHTML(articles, intro, date),
      }),
    })
    return res.ok
  } catch (err) {
    console.error('Email send error:', err)
    return false
  }
}

export async function sendConfirmationEmail(to: string, token: string): Promise<boolean> {
  if (!RESEND_API_KEY) return false
  const confirmUrl = `${APP_URL}/api/confirm?token=${token}&type=email`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to,
        subject: 'Confirm your JTN subscription',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:40px auto;padding:32px;border-radius:12px;border:1px solid #e5e7eb;">
            <h2 style="color:#1e3a8a;margin-bottom:12px;">Confirm your subscription</h2>
            <p style="color:#374151;">Click below to confirm your JTN Daily Digest subscription.</p>
            <a href="${confirmUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1e3a8a;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
              Confirm Subscription
            </a>
            <p style="margin-top:24px;font-size:12px;color:#9ca3af;">If you didn't sign up, you can ignore this email.</p>
          </div>
        `,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
