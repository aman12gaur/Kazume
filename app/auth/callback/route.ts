import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  
  console.log('Callback received:', { 
    code: !!code, 
    error, 
    error_description, 
    searchParams: Object.fromEntries(searchParams),
    url: request.url
  })
  
  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error_description || error)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      console.log('Session exchange successful, redirecting to dashboard')
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}/dashboard`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/dashboard`)
      } else {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    } else {
      console.error('Session exchange error:', error)
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error.message)}`)
    }
  }

  // If no code and no error, redirect to auth page
  console.log('No code, no error, redirecting to auth page')
  return NextResponse.redirect(`${origin}/auth`)
} 