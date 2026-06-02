import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/navbar';
import { MapLineupEditor } from '@/components/map-lineup-editor';
import { CS2_MAPS } from '@/lib/constants';
import { notFound } from 'next/navigation';

interface MapPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MapPage({ params }: MapPageProps) {
  const { slug } = await params;
  const map = CS2_MAPS.find((m) => m.slug === slug);
  
  if (!map) {
    notFound();
  }

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

  // Fetch lineup points for this map
  const { data: lineupPoints } = await supabase
    .from('lineup_points')
    .select(`
      *,
      profiles (id, username, avatar_url),
      comments (
        *,
        profiles (id, username, avatar_url)
      )
    `)
    .eq('map_name', slug)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} username={username} />
      <main>
        <MapLineupEditor 
          map={map} 
          initialLineups={lineupPoints || []} 
          user={user}
        />
      </main>
    </div>
  );
}

export function generateStaticParams() {
  return CS2_MAPS.map((map) => ({
    slug: map.slug,
  }));
}
