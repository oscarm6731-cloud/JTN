import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { value?: string }
    const value = body.value?.trim()
    if (!value) {
      return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 })
    }

    const db = createServiceClient()
    const isPhone = value.startsWith('+')

    const { error } = await db
      .from('subscribers')
      .delete()
      .eq(isPhone ? 'phone' : 'email', value)

    if (error) throw error

    return NextResponse.json({ message: "You've been unsubscribed successfully." })
  } catch (err) {
    console.error('Unsubscribe error:', err)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }
}
