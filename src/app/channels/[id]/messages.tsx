'use client'

import { useSyncExternalStore } from "react"
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

const subscribe = () => () => {}

function useHydrated() {
    return useSyncExternalStore(subscribe, () => true, () => false)
}

export default function Messages({ initialMessages, currentUserId }: MessagesProps) {
    const messages = initialMessages
    const hydrated = useHydrated()

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
                const time = hydrated
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
