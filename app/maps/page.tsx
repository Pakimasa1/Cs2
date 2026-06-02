import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/navbar';
import { MapGrid } from '@/components/map-grid';

export default async function MapsPage() {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} username={username} />
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">All Maps</h1>
            <p className="mt-2 text-muted-foreground">
              Select a map to view and contribute lineups
            </p>
          </div>
        </div>
        <MapGrid />
      </main>
    </div>
  );
}
