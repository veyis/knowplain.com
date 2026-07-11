'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createThread(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  const pillar = String(formData.get('pillar') ?? '').trim()

  // Validate before writing anything. Without this a blank title and body sail straight
  // into the database and show up as an empty thread on a public page.
  if (!title || !content) throw new Error('A thread needs a title and a first post.')

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

  if (postError) {
    // These are two writes, not one transaction. The thread is already committed, so a
    // failure here would leave an empty thread sitting on a public page forever. Undo it
    // rather than leave the forum littered with contentless posts.
    await supabase.from('knowplain_forum_threads').delete().eq('id', thread.id)
    throw new Error(postError.message)
  }

  revalidatePath('/forum')
  redirect(`/forum/${thread.id}`)
}

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const thread_id = String(formData.get('thread_id') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!thread_id) throw new Error('Missing thread.')
  if (!content) throw new Error('A reply needs some content.')

  const { error } = await supabase
    .from('knowplain_forum_posts')
    .insert({ thread_id, content, author_id: user.id })

  if (error) throw new Error(error.message)

  revalidatePath(`/forum/${thread_id}`)
}

export async function toggleLike(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const thread_id = formData.get('thread_id') as string

  // Check if liked
  const { data: existing } = await supabase
    .from('knowplain_forum_likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('thread_id', thread_id)
    .single()

  if (existing) {
    // unlike
    await supabase
      .from('knowplain_forum_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('thread_id', thread_id)
  } else {
    // like
    await supabase
      .from('knowplain_forum_likes')
      .insert({ user_id: user.id, thread_id })
  }

  revalidatePath(`/forum/${thread_id}`)
  revalidatePath('/forum')
}
