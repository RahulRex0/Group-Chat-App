import { createClient } from '@/utils/supabase/server'
import { signOut, createChannel, deleteChannel } from './actions'

export default async function Home() {
  const supabase = await createClient()
  const { data: {user} } = await supabase.auth.getUser()

  if(!user)
    return(
      <div>
                <h1>Group Chat</h1>
                <p>
                  Not logged in.
                  <a href="/login">Go to login →</a>
                </p>
      </div>

    )
  
  const { data: channels } = await supabase.from('channels').select('id, name, description').order('created_at', { ascending: true })

  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Group Chat</h1>
      <form action={signOut}>
      <button type="submit" style={{ padding: '8px 16px' }}>
        Log out
      </button>
      </form>
      <p>Logged in as <strong>{user.email}</strong></p>

      <ul>
        {channels?.map((c)=>(
          <li key={c.id}>
            <a href={`/channels/${c.id}`}># {c.name}</a>
            <form action={deleteChannel} style={{ display: 'inline', marginLeft: 8 }}>
              <input type="hidden" name="channelId" value={c.id} />
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>
      {channels?.length === 0 && <p>No channels yet — create the first one!</p>}
      <form action={createChannel}>
        <input name='name' placeholder='channel name'/>
        <button type='submit'>Create Channel</button>
      </form>
    </main>
  )
}