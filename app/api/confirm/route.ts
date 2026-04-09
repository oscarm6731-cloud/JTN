import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/?confirmed=error`)
  }

  try {
    const db = createServiceClient()
    const { data, error } = await db
      .from('subscribers')
      .update({ confirmed: true, confirmation_token: null })
      .eq('confirmation_token', token)
      .select()
      .maybeSingle()

    if (error || !data) {
      return NextResponse.redirect(`${APP_URL}/?confirmed=invalid`)
    }

    return NextResponse.redirect(`${APP_URL}/?confirmed=success`)
  } catch {
    return NextResponse.redirect(`${APP_URL}/?confirmed=error`)
  }
}
