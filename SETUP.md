# JTN — Setup & Deployment Guide

## 1. Prerequisites

- Node.js 18+
- A [Vercel](https://vercel.com) account
- A [Supabase](https://supabase.com) account (free tier)
- API keys (see below)

---

## 2. Get Your API Keys

| Service | Where to get it | Env var |
|---------|----------------|---------|
| Groq | [console.groq.com](https://console.groq.com) | `GROQ_API_KEY` |
| NewsAPI | [newsapi.org/register](https://newsapi.org/register) | `NEWS_API_KEY` |
| The Guardian | [open-platform.theguardian.com](https://open-platform.theguardian.com/access/) | `GUARDIAN_API_KEY` |
| New York Times | [developer.nytimes.com](https://developer.nytimes.com/get-started) | `NYT_API_KEY` |
| Resend (email) | [resend.com](https://resend.com) | `RESEND_API_KEY` |
| Twilio (SMS) | [twilio.com](https://www.twilio.com/try-twilio) | `TWILIO_*` |

---

## 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → **New query**
3. Paste the contents of `supabase/schema.sql` and click **Run**
4. Go to **Project Settings → API** and copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (under Service Role)

---

## 4. Local Development

```bash
# Clone and install
npm install

# Copy env file and fill in your keys
cp .env.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Test the news fetch manually

```bash
# Trigger a news fetch (replace YOUR_SECRET with value from .env.local)
curl -X POST http://localhost:3000/api/fetch-news \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test the newsletter send

```bash
curl -X POST http://localhost:3000/api/send-newsletter \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 5. Vercel Deployment

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Add all environment variables from `.env.example` in **Settings → Environment Variables**
4. Set `NEXT_PUBLIC_APP_URL` to your deployed URL (e.g. `https://jtn.vercel.app`)
5. Generate a strong `CRON_SECRET`:
   ```bash
   openssl rand -hex 32
   ```
6. Deploy — Vercel will automatically pick up `vercel.json` for the cron schedule

### Cron Schedule

The cron in `vercel.json` runs at `0 13 * * *` UTC = **5:00 AM Pacific (PST)** / 6:00 AM PDT.

> **Note:** Vercel Cron requires a Pro plan or higher for production use. On Hobby, crons run once per day max.

---

## 6. Email Setup (Resend)

1. Create a free account at [resend.com](https://resend.com)
2. Verify your sending domain under **Domains**
3. Create an API key under **API Keys**
4. Set `EMAIL_FROM` to `newsletter@yourdomain.com`

---

## 7. SMS Setup (Twilio)

1. Create a free Twilio account
2. Get a phone number (free trial gives you one)
3. Copy Account SID, Auth Token, and phone number to `.env.local`

---

## 8. Cost Breakdown (Free Tiers)

| Service | Free Tier Limit |
|---------|----------------|
| Vercel Hobby | 1 cron/day, 100GB bandwidth |
| Supabase Free | 500MB DB, 50MB storage |
| Groq | ~14,400 requests/day (generous) |
| NewsAPI | 100 requests/day (dev), upgrade for more |
| Guardian API | 12 requests/sec, unlimited/day |
| NYT API | 500 requests/day |
| Resend | 3,000 emails/month |
| Twilio | $15 trial credit (~1500 SMS) |

**Monthly cost at small scale: ~$0**

---

## 9. Folder Structure

```
JTN/
├── app/
│   ├── layout.tsx              # Root layout with Header + Footer
│   ├── page.tsx                # Homepage — top headlines
│   ├── daily-digest/page.tsx   # Daily digest by category
│   ├── category/[slug]/page.tsx # Category pages
│   ├── unsubscribe/page.tsx    # Unsubscribe page
│   └── api/
│       ├── fetch-news/route.ts  # Fetch + summarize + store articles
│       ├── subscribe/route.ts   # Subscribe endpoint
│       ├── confirm/route.ts     # Email/SMS confirmation
│       ├── unsubscribe/route.ts # Unsubscribe endpoint
│       ├── send-newsletter/route.ts # Send email + SMS digest
│       └── cron/route.ts        # Cron orchestrator
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── NewsCard.tsx
│   ├── CategoryFilter.tsx
│   ├── SearchBar.tsx
│   └── SubscribeForm.tsx
├── lib/
│   ├── supabase.ts
│   ├── groq.ts
│   ├── newsapi.ts
│   ├── email.ts
│   ├── twilio.ts
│   └── cache.ts
├── types/index.ts
├── supabase/schema.sql
├── vercel.json                  # Cron: 5 AM Pacific daily
└── .env.example
```
