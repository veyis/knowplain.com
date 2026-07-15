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
  if (title.length < 3 || title.length > 160) {
    throw new Error('Use a title between 3 and 160 characters.')
  }
  if (!content || content.length > 10_000) {
    throw new Error('Use a first post between 1 and 10,000 characters.')
  }

  // The database function owns the transaction and derives author_id from auth.uid().
  // A caller cannot attribute a thread to another profile, and a failed first post cannot
  // leave an empty thread behind.
  const { data: threadId, error } = await supabase.rpc('knowplain_create_forum_thread', {
    thread_title: title,
    thread_content: content,
    thread_pillar: pillar || null,
  })

  if (error || !threadId) throw new Error(error?.message || 'The thread could not be created.')

  revalidatePath('/forum')
  redirect(`/forum/${threadId}`)
}

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const thread_id = String(formData.get('thread_id') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!thread_id) throw new Error('Missing thread.')
  if (!content || content.length > 10_000) {
    throw new Error('Use a reply between 1 and 10,000 characters.')
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(thread_id)) {
    throw new Error('Invalid thread.')
  }

  const { error } = await supabase.rpc('knowplain_create_forum_post', {
    target_thread_id: thread_id,
    post_content: content,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/forum/${thread_id}`)
}

export async function reportContent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const threadId = String(formData.get('thread_id') || '').trim()
  const postId = String(formData.get('post_id') || '').trim()
  const reason = String(formData.get('reason') || '').trim()
  const details = String(formData.get('details') || '').trim()
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const reasons = new Set(['spam', 'harassment', 'dangerous-advice', 'privacy', 'other'])
  if ((Boolean(threadId) === Boolean(postId)) || (threadId && !uuid.test(threadId)) || (postId && !uuid.test(postId))) {
    throw new Error('Choose one valid item to report.')
  }
  if (!reasons.has(reason) || details.length > 1000) throw new Error('Invalid report.')

  const { error } = await supabase.from('knowplain_forum_reports').insert({
    reporter_id: user.id,
    thread_id: threadId || null,
    post_id: postId || null,
    reason,
    details,
  })
  if (error?.code === '23505') throw new Error('You already reported this item.')
  if (error) throw new Error('The report could not be submitted.')
  revalidatePath(threadId ? `/forum/${threadId}` : '/forum')
}

export async function toggleLike(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const thread_id = formData.get('thread_id') as string

  // Check if liked
  const { data: existing, error: lookupError } = await supabase
    .from('knowplain_forum_likes')
    .select('*')
    .eq('user_id', user.id)
    .eq('thread_id', thread_id)
    .maybeSingle()

  if (lookupError) throw new Error(lookupError.message)

  if (existing) {
    // unlike
    const { error } = await supabase
      .from('knowplain_forum_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('thread_id', thread_id)
    if (error) throw new Error(error.message)
  } else {
    // like
    const { error } = await supabase
      .from('knowplain_forum_likes')
      .insert({ user_id: user.id, thread_id })
    if (error) throw new Error(error.message)
  }

  revalidatePath(`/forum/${thread_id}`)
  revalidatePath('/forum')
}
