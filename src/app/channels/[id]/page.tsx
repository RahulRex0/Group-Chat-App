import { sendMessage } from '@/app/actions'
import Messages from './messages'
import styles from './page.module.css'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type ChannelPageProps = {
  params: Promise<{ id: string }>
}

const api = process.env.NEXT_PUBLIC_API_URL

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { id } = await params

  const token = (await cookies()).get("token")?.value
  if (!token) {
    redirect('/login')
  }

  const meRes = await fetch(`${api}/me`, {
    headers: { Cookie: `token=${token}` },
    cache: 'no-store'
  })

  const channelsRes= await fetch(`${api}/channels`,{
    headers: { Cookie: `token=${token}` },
    cache: 'no-store'
  })

  const messagesRes= await fetch(`${api}/channels/${id}/messages`,{
    headers: { Cookie: `token=${token}` },
    cache: 'no-store'
  })

  if (meRes.status === 401 || channelsRes.status === 401 || messagesRes.status === 401) {
    redirect('/login')
  }

  if (!meRes.ok || !channelsRes.ok || !messagesRes.ok) {
    throw new Error('Failed to load channel page')
  }


  const { user } = await meRes.json() as {
    user: { userId: string; username: string }
  }

  const { channels } = await channelsRes.json() as {
    channels: { id: string; name: string }[]
  }

  const { messages: initialMessages } = await messagesRes.json() as {
    messages: {
      id: string
      content: string
      created_at: string
      user_id: string
      username: string
    }[]
  }

  const channel = channels.find(c => c.id === id)

  if (!channel) redirect('/')

  return (
    <main className={styles.main}>
      <div className={styles.top}>
        <Link href="/" style={{color: '#666', fontSize:"14px"}}>← back to channels</Link>
        <div style={{fontSize:"28px", fontWeight:"bold"}}># {channel.name}</div>
      </div>
      <div className={styles.message}>
        <Messages key={id} initialMessages={initialMessages} currentUserId={user.userId } channelId={id} />
      </div>


      <form action={sendMessage} className={styles.bottom}>
        <input type="hidden" name="channelId" value={id} />
        <input name="content" placeholder="Type a message…" required autoComplete="off" className={styles.input} />
        <button className={styles.button} type="submit">Send</button>
      </form>
    </main>
  )
}
