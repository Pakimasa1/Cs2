'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile, LineupPoint } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User as UserIcon, MapPin, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CS2_MAPS } from '@/lib/constants';

interface ProfilePageProps {
  user: User;
  profile: Profile | null;
  lineups: LineupPoint[];
}

export function ProfilePage({ user, profile, lineups }: ProfilePageProps) {
  const [username, setUsername] = useState(profile?.username || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  };

  const getMapName = (slug: string) => {
    return CS2_MAPS.find((m) => m.slug === slug)?.name || slug;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 flex items-center gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
            {(profile?.username || user.email || 'U')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile?.username || 'Player'}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {lineups.length} lineups
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Joined {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Update Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-primary/50 bg-primary/10 text-primary">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Profile updated successfully!</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email || ''}
                  disabled
                  className="bg-secondary"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User's Lineups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Your Lineups
            </CardTitle>
            <CardDescription>Lineups you have contributed</CardDescription>
          </CardHeader>
          <CardContent>
            {lineups.length === 0 ? (
              <div className="py-8 text-center">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">{"You haven't created any lineups yet"}</p>
                <Button className="mt-4" asChild>
                  <Link href="/maps">Browse Maps</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {lineups.slice(0, 10).map((lineup) => (
                  <Link
                    key={lineup.id}
                    href={`/maps/${lineup.map_name}`}
                    className="block rounded-lg border border-border p-3 transition-colors hover:border-primary/50 hover:bg-secondary/50"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-1 h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: lineup.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-medium">{lineup.title}</h4>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getMapName(lineup.map_name)}
                          </Badge>
                          <Badge variant={lineup.side === 'T' ? 'default' : 'secondary'} className="text-xs">
                            {lineup.side}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {lineups.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground">
                    And {lineups.length - 10} more...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
