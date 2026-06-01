'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
export async function createChannel(formData: FormData) {
    const name = formData.get('name') as string
    if (!name?.trim()) return
  
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
  
    await supabase.from('channels').insert({
      name: name.trim(),
      created_by: user.id,
    })
  
    revalidatePath('/')
  }
  export async function sendMessage(formData: FormData) {
    const content = (formData.get('content') as string)?.trim()
    const channelId = formData.get('channelId') as string
    if (!content || !channelId) return
  
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
  
    await supabase.from('messages').insert({
      content,
      channel_id: channelId,
      user_id: user.id,
    })

    revalidatePath(`/channels/${channelId}`)
  }
  export async function deleteChannel(formData: FormData) {
    const channelId = formData.get('channelId') as string
    if (!channelId) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return // any logged-in user may delete; just block anonymous

    await supabase
      .from('channels')
      .delete()
      .eq('id', channelId)

    revalidatePath('/')
  }