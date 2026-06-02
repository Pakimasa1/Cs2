import { Target, Users, Map, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Precise Lineups',
    description: 'Click anywhere on the map to mark exact positions for your smoke, flash, and molotov throws.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Learn from other players and share your own discoveries with the community.',
  },
  {
    icon: Map,
    title: 'All Active Maps',
    description: 'Coverage for all competitive CS2 maps including Dust 2, Mirage, Inferno, and more.',
  },
  {
    icon: MessageSquare,
    title: 'Global Chat',
    description: 'Discuss strategies, ask questions, and connect with fellow CS2 enthusiasts.',
  },
];

export function FeaturesSection() {
  return (
    <section className="border-t border-border bg-card/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why HAKI TAN?</h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to perfect your utility game
          </p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
