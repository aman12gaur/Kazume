'use server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    if (error.message === 'Email not confirmed') {
      redirect('/login/confirm')
    }
    throw new Error(error.message)
  }
  redirect('/private')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/confirm`,
    },
  })
  if (error) {
    throw new Error(error.message)
  }
  // Insert into users table if not already present
  const user = data?.user;
  if (user) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();
    if (!existing) {
      await supabase.from('users').insert([
        { id: user.id, email: user.email }
      ])
    }
  }
  redirect('/login?signup=success')
} 