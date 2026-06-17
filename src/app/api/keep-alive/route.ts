import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const { error } = await supabase
    .from('channels')
    .select('id', { head: true, count: 'exact' })

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true, pingedAt: new Date().toISOString() })
}
