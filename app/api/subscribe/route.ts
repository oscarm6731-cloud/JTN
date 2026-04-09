import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendConfirmationEmail } from '@/lib/email'
import { sendConfirmationSMS } from '@/lib/twilio'
import crypto from 'crypto'

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: string; phone?: string; preferences?: string[] }
    const { email, phone, preferences = ['general'] } = body

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Basic phone validation (E.164 format)
    if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Phone must be in E.164 format (e.g. +12125551234)' },
        { status: 400 }
      )
    }

    const db = createServiceClient()
    const token = generateToken()

    // Check if already subscribed
    if (email) {
      const { data: existing } = await db
        .from('subscribers')
        .select('id, confirmed')
        .eq('email', email)
        .maybeSingle()

      if (existing?.confirmed) {
        return NextResponse.json({ message: 'Already subscribed' })
      }
    }

    // Upsert subscriber
    const { error: upsertError } = await db.from('subscribers').upsert(
      {
        email: email ?? null,
        phone: phone ?? null,
        confirmed: false,
        confirmation_token: token,
        preferences,
      },
      { onConflict: email ? 'email' : 'phone' }
    )

    if (upsertError) throw upsertError

    // Send confirmation
    let confirmSent = false
    if (email) {
      confirmSent = await sendConfirmationEmail(email, token)
    } else if (phone) {
      confirmSent = await sendConfirmationSMS(phone, token)
    }

    return NextResponse.json({
      message: confirmSent
        ? 'Confirmation sent! Check your inbox.'
        : 'Subscribed! (confirmation delivery unavailable in dev mode)',
    })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
