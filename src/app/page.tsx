import { createClient } from '@/utils/supabase/server'
import { signOut } from './actions'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Group Chat</h1>
      {data.user ? (
        <>
          <p>Logged in as <strong>{data.user.email}</strong> 🎉</p>
          <form action={signOut}>
            <button type="submit" style={{ padding: '8px 16px' }}>Log out</button>
          </form>
        </>
      ) : (
        <p>Not logged in. <a href="/login">Go to login →</a></p>
      )}
    </main>
  )
}