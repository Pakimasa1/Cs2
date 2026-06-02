import Link from 'next/link';
import { CS2_MAPS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export function MapGrid() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Choose Your Battlefield</h2>
          <p className="mt-4 text-muted-foreground">
            Select a map to view and contribute lineups
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CS2_MAPS.map((map) => (
            <Link key={map.slug} href={`/maps/${map.slug}`}>
              <Card className="group cursor-pointer overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden bg-secondary">
                    {/* Placeholder for map image - shows map name as fallback */}
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted">
                      <MapPin className="h-12 w-12 text-muted-foreground/50 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                      {map.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      View lineups
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
