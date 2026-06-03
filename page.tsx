import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()

  const supabase = createClient(cookieStore)

  const { data: todos, error } = await supabase
    .from('todos')
    .select('*')

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}