'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: result, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // When email confirmation is on (the Supabase default), signUp succeeds but returns NO
  // session — the account is not usable until the link is clicked. Redirecting to "/" here
  // dropped the user back on the homepage still logged out, with nothing telling them why.
  // Say what actually happened instead.
  if (!result.session) {
    redirect(
      '/login?message=' +
        encodeURIComponent('Check your email for a confirmation link to finish signing up.'),
    )
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
