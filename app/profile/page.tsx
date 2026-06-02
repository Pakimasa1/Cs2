import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/navbar';
import { ProfilePage } from '@/components/profile-page';
import { redirect } from 'next/navigation';

export default async function Profile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch user's lineups
  const { data: lineups } = await supabase
    .from('lineup_points')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} username={profile?.username || null} />
      <main>
        <ProfilePage 
          user={user} 
          profile={profile} 
          lineups={lineups || []}
        />
      </main>
    </div>
  );
}
