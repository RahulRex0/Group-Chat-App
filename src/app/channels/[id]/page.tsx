import { sendMessage } from '@/app/actions'
import Messages from './messages'
import styles from './page.module.css'
import Link from 'next/link'

type ChannelPageProps = {
  params: Promise<{ id: string }>
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { id } = await params

  const channel = null as { name: string; description: string | null } | null
  const currentUserId: string | null = null
  const initialMessages: {
    id: string
    content: string
    created_at: string
    user_id: string
    username: string
  }[] = []

  return (
    <main className={styles.main}>
      <div className={styles.top}>
        <Link href="/" style={{color: '#666', fontSize:"14px"}}>← back to channels</Link>
        <div style={{fontSize:"28px", fontWeight:"bold"}}># {channel?.name ?? 'Unknown channel'}</div>
      </div>
      <div className={styles.message}>
        <Messages initialMessages={initialMessages} currentUserId={currentUserId} channelId={id} />
      </div>


      <form action={sendMessage} className={styles.bottom}>
        <input type="hidden" name="channelId" value={id} />
        <input name="content" placeholder="Type a message…" required autoComplete="off" className={styles.input} />
        <button className={styles.button} type="submit">Send</button>
      </form>
    </main>
  )
}
