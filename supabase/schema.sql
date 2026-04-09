-- ─── JTN Database Schema ─────────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor (project → SQL Editor → New query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── articles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  summary      TEXT NOT NULL DEFAULT '',
  key_points   TEXT[] NOT NULL DEFAULT '{}',
  url          TEXT NOT NULL UNIQUE,
  image_url    TEXT,
  source_name  TEXT NOT NULL,
  source_url   TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'general'
                 CHECK (category IN ('politics','sports','world','business','tech','entertainment','general')),
  published_at TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS articles_category_idx      ON articles (category);
CREATE INDEX IF NOT EXISTS articles_published_at_idx  ON articles (published_at DESC);
CREATE INDEX IF NOT EXISTS articles_title_search_idx  ON articles USING gin (to_tsvector('english', title));

-- Auto-delete articles older than 7 days (keeps DB small on free tier)
-- Run this as a scheduled function or cron via Supabase Edge Functions

-- ─── subscribers ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscribers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               TEXT UNIQUE,
  phone               TEXT UNIQUE,
  confirmed           BOOLEAN NOT NULL DEFAULT FALSE,
  confirmation_token  TEXT,
  preferences         TEXT[] NOT NULL DEFAULT '{general}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS subscribers_email_idx   ON subscribers (email);
CREATE INDEX IF NOT EXISTS subscribers_phone_idx   ON subscribers (phone);
CREATE INDEX IF NOT EXISTS subscribers_confirmed_idx ON subscribers (confirmed);

-- ─── newsletter_logs ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  articles_count INT NOT NULL DEFAULT 0,
  emails_sent    INT NOT NULL DEFAULT 0,
  sms_sent       INT NOT NULL DEFAULT 0
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Articles are public-readable
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles_public_read" ON articles FOR SELECT USING (true);

-- Subscribers: only service role can read/write (no anon access)
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Newsletter logs: only service role
ALTER TABLE newsletter_logs ENABLE ROW LEVEL SECURITY;
