'use client'

import { useState, useEffect } from "react"
import { createClient } from '@/utils/supabase/client'

type Messages = {
    id: string
    content: string
    created_at: string
    user_id: string
    username: string
}
type MessagesProps = {
    initialMessages: Messages[]
    currentUserId: string | null
    channelId: string
}

export default function Messages({ initialMessages, currentUserId, channelId }: MessagesProps) {
    const [messages, setMessages] = useState(initialMessages)

    useEffect(() => {
        const supabase = createClient()
        let channel: ReturnType<typeof supabase.channel> | null = null

        async function start() {
            const { data: { session } } = await supabase.auth.getSession()
            await supabase.realtime.setAuth(session?.access_token ?? null)

            channel = supabase
                .channel(`messages:${channelId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `channel_id=eq.${channelId}`,
                    },
                    async (payload) => {
                        console.log('realtime INSERT received:', payload.new)

                        const row = payload.new as {
                            id: string
                            content: string
                            created_at: string
                            user_id: string
                        }

                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('username')
                            .eq('id', row.user_id)
                            .single()

                        setMessages((current) => {
                            if (current.some((m) => m.id === row.id)) return current
                            return [...current, { ...row, username: profile?.username ?? 'Unknown' }]
                        })
                    }
                )
                .subscribe((status) => {
                    console.log('realtime status:', status)
                })
        }

        start()

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [channelId])


    return (
        <div>
            {messages.length === 0 && <p>No messages yet.</p>}
            {messages.map((m) => (
                <p key={m.id}>
                    <strong>
                        {m.username}
                        {m.user_id === currentUserId ? ' (you)' : ''}:
                    </strong>{' '}
                    {m.content}
                </p>
            ))}
        </div>
    )
}