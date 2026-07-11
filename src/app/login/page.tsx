'use client'

import { useState } from "react"
import Image from "next/image"
import styles from "./login.module.css"
import { useRouter } from "next/navigation"

export default function LoginPage(){
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [message,setMessage]=useState('')

    const api= process.env.NEXT_PUBLIC_API_URL
    const router = useRouter() 

    async function handleSignUp() {

        try {
            const res= await fetch(`${api}/register`,{
                method:"post",
                headers:{"content-type":"application/json"},
                body:JSON.stringify({email,password})
            })
            const data = await res.json() 

            if(!res.ok){
                setMessage(data.error)
                return
            }

            setMessage("account created — now log in")

        } catch (error) {
            console.log(error)
            setMessage("can't reach the server — is it running?")
        }


    }

    async function handleLogIn() {

        try {
            const res= await fetch(`${api}/login`,{
                method:"post",
                headers:{"content-type":"application/json"},
                credentials:"include",
                body:JSON.stringify({email,password})
            })
            const data = await res.json()

            if(!res.ok){
                setMessage(data.error)
                return
            }

            localStorage.setItem("user",JSON.stringify(data.user))
            router.push("/") 

        } catch (error) {
            console.log(error)
            setMessage("can't reach the server")
        }

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
