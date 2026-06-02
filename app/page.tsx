import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { MapGrid } from '@/components/map-grid';
import { FeaturesSection } from '@/components/features-section';

export default async function HomePage() {
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
      <main>
        <HeroSection />
        <MapGrid />
        <FeaturesSection />
      </main>
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>HAKI TAN - CS2 Lineup Tool</p>
          <p className="mt-2">Master your lineups, dominate the competition.</p>
        </div>
      </footer>
    </div>
  );
}
