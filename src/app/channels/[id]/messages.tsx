'use client'

import { useState, useEffect } from "react"
import { createClient } from '@/utils/supabase/client'
import styles from "./messages.module.css"

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
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const supabase = createClient()
        let channel: ReturnType<typeof supabase.channel> | null = null
        let cancelled = false

        async function start() {
            const { data: { session } } = await supabase.auth.getSession()
            if (cancelled) return
            await supabase.realtime.setAuth(session?.access_token ?? null)
            if (cancelled) return

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
            cancelled = true
            if (channel) supabase.removeChannel(channel)
        }
    }, [channelId])


    return (
        <div className={styles.list}>
            {messages.length === 0 && (
                <div className={styles.empty}>
                    <span className={styles.emptyIcon}>💬</span>
                    <p>No messages yet — say hello!</p>
                </div>
            )}
            {messages.map((m) => {
                const mine = m.user_id === currentUserId
                const time = mounted
                    ? new Date(m.created_at).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                    })
                    : ''
                return (
                    <div key={m.id} className={`${styles.row} ${mine ? styles.mine : styles.theirs}`}>
                        {!mine && <div className={styles.avatar}>{m.username.slice(0, 2).toUpperCase()}</div>}
                        <div className={styles.bubble}>
                            <div className={styles.meta}>
                                {!mine && <span className={styles.name}>{m.username}</span>}
                                <span className={styles.time}>{time}</span>
                            </div>
                            <div className={styles.content}>{m.content}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
    
}