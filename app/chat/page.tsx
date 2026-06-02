import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/navbar';
import { GlobalChat } from '@/components/global-chat';

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();
    username = profile?.username || null;
  }

  // Fetch initial messages
  const { data: messages } = await supabase
    .from('chat_messages')
    .select(`
      *,
      profiles (id, username, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={user} username={username} />
      <main className="flex-1">
        <GlobalChat 
          initialMessages={messages?.reverse() || []} 
          user={user}
          username={username}
        />
      </main>
    </div>
  );
}
