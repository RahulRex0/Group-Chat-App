import { createClient } from '@/utils/supabase/server'
import { sendMessage } from '@/app/actions'
import Messages from './messages'

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
    <main>
      <a href="/">← back to channels</a>
      <h1># {channel?.name ?? 'Unknown channel'}</h1>

      <Messages initialMessages={initialMessages} currentUserId={user?.id ?? null} channelId={id} />

      <form action={sendMessage}>
        <input type="hidden" name="channelId" value={id} />
        <input name="content" placeholder="Type a message…" required autoComplete="off" />
        <button type="submit">Send</button>
      </form>
    </main>
  )
}