import { createClient } from '@/utils/supabase/server'
import { signOut, createChannel, deleteChannel } from './actions'
import styles from '@/app/page.module.css'
import Image from 'next/image'

const gradients = [
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #3b82f6, #06b6d4)',
  'linear-gradient(135deg, #ec4899, #d946ef)',
  'linear-gradient(135deg, #6366f1, #4f46e5)',
  'linear-gradient(135deg, #14b8a6, #06b6d4)',
]

export default async function Home() {
  const supabase = await createClient()
  const { data: {user} } = await supabase.auth.getUser()

  if(!user)
    return(
      <div>
                <div>Group Chat</div>
                <p>
                  Not logged in.
                  <a href="/login">Go to login →</a>
                </p>
      </div>

    )
  
  const { data: channels } = await supabase.from('channels').select('id, name, description').order('created_at', { ascending: true })

  return (
    <main className={styles.main}>
      <div className={styles.first}>
        <div className={styles.groupchat}>
          <Image src="/images/groupchat-logo.svg" alt='groupchat icon' width={100} height={100} className={styles.image} />
          <span style={{fontWeight:'bold', fontSize:'30px'}}>Group Chat</span>

        </div>
        <form action={signOut}>
        <button type="submit" className={styles.button}>
          Log out
        </button>
        </form>
      </div>
      
      <div style={{display:'flex', gap:'8px', marginTop:"5px"}}>
        <div style={{fontWeight:'100', color: '#666'}}>Logged in as</div>
        <strong>{user.email}</strong>
      </div>
      <div style={{fontWeight:"bold", marginTop:"20px"}}>channels</div>
<div>
  <div>
        {channels?.map((c, index)=>(
          <div className={styles.Group} key={c.id}>
            <a href={`/channels/${c.id}`} className={styles.channelLink}>
              <span className={styles.hash} style={{ background: gradients[index % gradients.length] }}>#</span>
              <span>{c.name}</span>
            </a>
            <form action={deleteChannel} style={{ display: 'inline', marginLeft: 8 }}>
              <input type="hidden" name="channelId" value={c.id} />
              <button type="submit" className={styles.button}>Delete</button>
            </form>
          </div>
        ))}
    </div>
</div>

<div className={styles.bottom}>
  <div style={{fontWeight:"bold", color: '#666'}} >
    CREATE A CHANNEL
  </div>

        {channels?.length === 0 && <p>No channels yet — create the first one!</p>}
        <form action={createChannel} className={styles.box}>
          <input name='name' placeholder='channel name here' className={styles.input} />
          <button type='submit' className={styles.create} >Create</button>
        </form>
</div>


    </main>
  )
}