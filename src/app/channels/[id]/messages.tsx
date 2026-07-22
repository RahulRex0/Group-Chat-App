'use client'

import styles from "./messages.module.css"
import { useEffect, useSyncExternalStore, useState } from "react"

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

export default function Messages({ initialMessages, currentUserId, channelId }: MessagesProps) {
    const [liveMessages, setLiveMessages] = useState<Messages[]>([])

    const messagesById = new Map<string, Messages>()
    
    for (const message of [...initialMessages, ...liveMessages]) {
        messagesById.set(message.id, message)
    }
    
    const messages = Array.from(messagesById.values())
    const hydrated = useHydrated()

    useEffect(()=>{

        const apiUrl= process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) return

        const socketUrl = new URL(apiUrl)
        socketUrl.protocol =
            socketUrl.protocol === "https:" ? "wss:" : "ws:"

        const socket = new WebSocket(socketUrl)

        const handleOpen = () => {
            console.log("WebSocket connected")

            const subscription = {
                type: "subscribe",
                channelId
            }
        
            socket.send(JSON.stringify(subscription))
        }

        const handleMessage = (socketEvent: MessageEvent) => {
            if (typeof socketEvent.data !== "string") return
        
            try {
                const event = JSON.parse(socketEvent.data)
        
                if (
                    event.type === "message_created" &&
                    event.channelId === channelId
                ) {
                    setLiveMessages((currentMessages) => {
                        const alreadyExists = currentMessages.some(
                            (message) => message.id === event.message.id
                        )
                    
                        if (alreadyExists) {
                            return currentMessages
                        }
                    
                        return [...currentMessages, event.message]
                    })
                }
            } catch {
                return
            }
        }
    
        socket.addEventListener("open", handleOpen)
        socket.addEventListener("message", handleMessage)

        return()=>{
            socket.removeEventListener("open", handleOpen)
            socket.removeEventListener("message", handleMessage)
            socket.close()
        }
    },[channelId])

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
