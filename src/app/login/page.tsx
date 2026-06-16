'use client'

import { useState } from "react"
import Image from "next/image"
import styles from "./login.module.css"

export default function LoginPage(){
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [message,setMessage]=useState('')

    async function handleSignUp() {
        setMessage('Sign up is not connected to a backend yet.')
    }

    async function handleLogIn() {
        setMessage('Login is not connected to a backend yet.')
    }

    return(
        <main className={styles.page}>
            <div className={styles.card}>
                <Image src="/images/groupchat-logo.svg" alt='groupchat icon' width={56} height={56} className={styles.logo} />
                <h1 className={styles.title}>Welcome back</h1>
                <p className={styles.subtitle}>Log in or create an account to start chatting.</p>
                <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className={styles.input} />
                <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className={styles.input} />
                <div className={styles.actions}>
                    <button onClick={handleLogIn} className={styles.login}>Login</button>
                    <button onClick={handleSignUp} className={styles.signup}>Sign Up</button>
                </div>
                {message && <p className={styles.error}>{message}</p>}
            </div>
        </main>
    )
}
