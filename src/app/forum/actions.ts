'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createThread(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const pillar = formData.get('pillar') as string

  // 1. Insert thread
  const { data: thread, error: threadError } = await supabase
    .from('knowplain_forum_threads')
    .insert({ title, pillar, author_id: user.id })
    .select('id')
    .single()

  if (threadError) throw new Error(threadError.message)

  // 2. Insert first post
  const { error: postError } = await supabase
    .from('knowplain_forum_posts')
    .insert({ thread_id: thread.id, content, author_id: user.id })

  if (postError) throw new Error(postError.message)

  revalidatePath('/forum')
  redirect(`/forum/${thread.id}`)
}

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const thread_id = formData.get('thread_id') as string
  const content = formData.get('content') as string

  const { error } = await supabase
    .from('knowplain_forum_posts')
    .insert({ thread_id, content, author_id: user.id })

  if (error) throw new Error(error.message)

  revalidatePath(`/forum/${thread_id}`)
}
