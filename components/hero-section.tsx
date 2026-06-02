import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Target, Crosshair } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Crosshair className="h-4 w-4" />
            <span>Community-Driven CS2 Lineups</span>
          </div>
          
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Master Your{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CS2 Lineups
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Discover, create, and share precise smoke, flash, and molotov lineups for every map. 
            Join the HAKI TAN community and elevate your gameplay.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <Link href="/maps">
                <Target className="h-5 w-5" />
                Browse Lineups
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/chat">Join the Discussion</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
