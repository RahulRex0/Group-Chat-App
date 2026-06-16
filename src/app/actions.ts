'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signOut() {
  redirect('/login')
}

export async function createChannel(formData: FormData) {
  const name = formData.get('name') as string
  if (!name?.trim()) return

  revalidatePath('/')
}

export async function sendMessage(formData: FormData) {
  const content = (formData.get('content') as string)?.trim()
  const channelId = formData.get('channelId') as string
  if (!content || !channelId) return

  revalidatePath(`/channels/${channelId}`)
}

export async function deleteChannel(formData: FormData) {
  const channelId = formData.get('channelId') as string
  if (!channelId) return

  revalidatePath('/')
}
