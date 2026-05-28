'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export default function LoginPage(){
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [message,setMessage]=useState('')
    const router= useRouter()
    const supabase= createClient()

    async function handleSignUp() {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setMessage(error.message)
        else router.push('/')
      }
    
      async function handleLogIn() {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setMessage(error.message)
        else router.push('/')
      }
    
    return(
        <main>
            <div>Login</div>
            <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <button onClick={handleLogIn}>Login</button>
            <button onClick={handleSignUp}>Sign Up</button>
            {message && <p style={{ color: 'crimson' }}>{message}</p>}
        </main>
    )
}