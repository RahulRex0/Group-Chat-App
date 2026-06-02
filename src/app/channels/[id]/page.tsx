import { createClient } from '@/utils/supabase/server'
import { sendMessage } from '@/app/actions'
import Messages from './messages'
import styles from './page.module.css'

type ChannelPageProps = {
  params: Promise<{ id: string }>
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: channel } = await supabase
    .from('channels')
    .select('name, description')
    .eq('id', id)
    .single()

  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, created_at, user_id')
    .eq('channel_id', id)
    .order('created_at', { ascending: true })

  const senderIds = [...new Set((messages ?? []).map((m) => m.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', senderIds)

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.username]))

  const initialMessages = (messages ?? []).map((m) => ({
    ...m,
    username: nameById.get(m.user_id) ?? 'Unknown',
  }))

  return (
    <main className={styles.main}>
      <div className={styles.top}>
        <a href="/" style={{color: '#666', fontSize:"14px"}}>← back to channels</a>
        <div style={{fontSize:"28px", fontWeight:"bold"}}># {channel?.name ?? 'Unknown channel'}</div>
      </div>
      <div className={styles.message}>
        <Messages initialMessages={initialMessages} currentUserId={user?.id ?? null} channelId={id} />
      </div>


      <form action={sendMessage} className={styles.bottom}>
        <input type="hidden" name="channelId" value={id} />
        <input name="content" placeholder="Type a message…" required autoComplete="off" className={styles.input} />
        <button className={styles.button} type="submit">Send</button>
      </form>
    </main>
  )
}