import { createClient } from '@/utils/supabase/server'
import { sendMessage } from '@/app/actions'

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

  return (
    <main>
      <a href="/">← back to channels</a>
      <h1># {channel?.name ?? 'Unknown channel'}</h1>

      <div>
        {messages?.length === 0 && <p>No messages yet.</p>}
        {messages?.map((m) => (
          <p key={m.id}>
            <strong>
              {nameById.get(m.user_id) ?? 'Unknown'}
              {m.user_id === user?.id ? ' (you)' : ''}:
            </strong>{' '}
            {m.content}
          </p>
        ))}
      </div>

      <form action={sendMessage}>
        <input type="hidden" name="channelId" value={id} />
        <input name="content" placeholder="Type a message…" required autoComplete="off"/>
        <button type="submit">Send</button>
      </form>
    </main>
  )
}