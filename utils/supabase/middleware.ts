import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from './server'

export async function updateSession(request: NextRequest) {
  const supabase = await createClient()
  // This will refresh the session if needed
  await supabase.auth.getUser()
  return NextResponse.next()
} 