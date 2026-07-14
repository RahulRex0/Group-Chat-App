'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const api = process.env.NEXT_PUBLIC_API_URL

export async function signOut() {

  const cookieStore = await cookies()
  cookieStore.delete('token')

  redirect('/login')
}

export async function createChannel(formData: FormData) {
  const name = formData.get('name') as string
  if (!name?.trim()) return

    const token = (await cookies()).get("token")?.value
    if(!token){
      redirect("/login")
    }

    const res= await fetch(`${api}/channels`,{
      method:"post",
      headers:{"content-type":"application/json",Cookie: `token=${token}`},
      body:JSON.stringify({ name })
    })

  if(!res.ok){return}
  revalidatePath('/')
}

export async function sendMessage(formData: FormData) {
  const content = (formData.get('content') as string)?.trim()
  const channelId = formData.get('channelId') as string
  if (!content || !channelId) return

  const token = (await cookies()).get('token')?.value
  if (!token) {
    redirect('/login')
  }

  const res = await fetch(`${api}/channels/${channelId}/messages`, {
    method: 'post',
    headers: {
      'content-type': 'application/json',
      Cookie: `token=${token}`,
    },
    body: JSON.stringify({ content }),
  })

  if (!res.ok) return

  revalidatePath(`/channels/${channelId}`)
}

export async function deleteChannel(formData: FormData) {
  const channelId = formData.get('channelId') as string
  if (!channelId) return

  const token = (await cookies()).get("token")?.value
  if(!token){
    redirect("/login")
  }

  const res= await fetch(`${api}/channels/${channelId}`,{
    method:"delete",
    headers:{Cookie: `token=${token}`}
  })

  if(!res.ok){return}

  revalidatePath('/')
}
