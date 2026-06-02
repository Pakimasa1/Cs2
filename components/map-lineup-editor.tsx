'use client';

import { useState, useRef, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { MapData, LineupPoint } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LINEUP_COLORS } from '@/lib/constants';
import { Plus, X, MapPin, User as UserIcon, Clock, MessageSquare, Trash2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MapLineupEditorProps {
  map: MapData;
  initialLineups: LineupPoint[];
  user: User | null;
}

export function MapLineupEditor({ map, initialLineups, user }: MapLineupEditorProps) {
  const [lineups, setLineups] = useState<LineupPoint[]>(initialLineups);
  const [selectedSide, setSelectedSide] = useState<'T' | 'CT'>('T');
  const [selectedLineup, setSelectedLineup] = useState<LineupPoint | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPoint, setNewPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    throw_instructions: '',
    additional_notes: '',
    color: LINEUP_COLORS[0].value,
  });
  const [newComment, setNewComment] = useState('');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const filteredLineups = lineups.filter((l) => l.side === selectedSide);

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!user || !isCreating) return;

      const rect = mapContainerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setNewPoint({ x, y });
      setIsDialogOpen(true);
    },
    [user, isCreating]
  );

  const handleCreateLineup = async () => {
    if (!user || !newPoint) return;

    const { data, error } = await supabase
      .from('lineup_points')
      .insert({
        map_name: map.slug,
        side: selectedSide,
        title: formData.title,
        description: formData.description || null,
        throw_instructions: formData.throw_instructions || null,
        additional_notes: formData.additional_notes || null,
        color: formData.color,
        x_position: newPoint.x,
        y_position: newPoint.y,
        user_id: user.id,
      })
      .select(`
        *,
        profiles (id, username, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating lineup:', error);
      return;
    }

    setLineups([data, ...lineups]);
    setIsDialogOpen(false);
    setNewPoint(null);
    setIsCreating(false);
    setFormData({
      title: '',
      description: '',
      throw_instructions: '',
      additional_notes: '',
      color: LINEUP_COLORS[0].value,
    });
  };

  const handleDeleteLineup = async (lineupId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('lineup_points')
      .delete()
      .eq('id', lineupId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting lineup:', error);
      return;
    }

    setLineups(lineups.filter((l) => l.id !== lineupId));
    if (selectedLineup?.id === lineupId) {
      setSelectedLineup(null);
    }
  };

  const handleAddComment = async () => {
    if (!user || !selectedLineup || !newComment.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        lineup_point_id: selectedLineup.id,
        user_id: user.id,
        content: newComment.trim(),
      })
      .select(`
        *,
        profiles (id, username, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return;
    }

    // Update the lineup with the new comment
    setLineups(
      lineups.map((l) =>
        l.id === selectedLineup.id
          ? { ...l, comments: [...(l.comments || []), data] }
          : l
      )
    );
    setSelectedLineup({
      ...selectedLineup,
      comments: [...(selectedLineup.comments || []), data],
    });
    setNewComment('');
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full border-b border-border bg-card lg:w-80 lg:border-b-0 lg:border-r">
        <div className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <Link href="/maps">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">{map.name}</h1>
          </div>

          {/* Side Toggle */}
          <Tabs value={selectedSide} onValueChange={(v) => setSelectedSide(v as 'T' | 'CT')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="T" className="data-[state=active]:bg-t data-[state=active]:text-primary-foreground">
                T Side
              </TabsTrigger>
              <TabsTrigger value="CT" className="data-[state=active]:bg-ct data-[state=active]:text-primary-foreground">
                CT Side
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Add Lineup Button */}
          {user ? (
            <Button
              className="mt-4 w-full gap-2"
              variant={isCreating ? 'secondary' : 'default'}
              onClick={() => setIsCreating(!isCreating)}
            >
              {isCreating ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Lineup
                </>
              )}
            </Button>
          ) : (
            <Button className="mt-4 w-full" asChild>
              <Link href="/auth/login">Sign in to add lineups</Link>
            </Button>
          )}

          {isCreating && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Click on the map to place a lineup point
            </p>
          )}
        </div>

        {/* Lineups List */}
        <ScrollArea className="h-[300px] lg:h-[calc(100vh-280px)]">
          <div className="space-y-2 p-4 pt-0">
            {filteredLineups.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No lineups for {selectedSide} side yet
              </p>
            ) : (
              filteredLineups.map((lineup) => (
                <Card
                  key={lineup.id}
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary/50',
                    selectedLineup?.id === lineup.id && 'border-primary'
                  )}
                  onClick={() => setSelectedLineup(lineup)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-1 h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: lineup.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium">{lineup.title}</h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <UserIcon className="h-3 w-3" />
                          <span className="truncate">
                            {lineup.profiles?.username || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Map Area */}
      <div className="flex-1 p-4 lg:p-6">
        <div
          ref={mapContainerRef}
          className={cn(
            'relative mx-auto aspect-square max-w-3xl overflow-hidden rounded-lg border border-border bg-secondary',
            isCreating && 'cursor-crosshair'
          )}
          onClick={handleMapClick}
        >
          {/* Map placeholder background */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <div className="text-center">
              <MapPin className="mx-auto h-16 w-16 text-muted-foreground/30" />
              <p className="mt-2 text-lg font-medium text-muted-foreground/50">{map.name}</p>
            </div>
          </div>

          {/* Lineup Points */}
          {filteredLineups.map((lineup) => (
            <button
              key={lineup.id}
              className={cn(
                'absolute z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-background shadow-lg transition-transform hover:scale-125',
                selectedLineup?.id === lineup.id && 'scale-125 ring-2 ring-white'
              )}
              style={{
                left: `${lineup.x_position}%`,
                top: `${lineup.y_position}%`,
                backgroundColor: lineup.color,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLineup(lineup);
              }}
            >
              <span className="sr-only">{lineup.title}</span>
            </button>
          ))}

          {/* New point preview */}
          {newPoint && (
            <div
              className="absolute z-20 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border-2 border-dashed border-white bg-primary"
              style={{
                left: `${newPoint.x}%`,
                top: `${newPoint.y}%`,
              }}
            />
          )}
        </div>

        {/* Selected Lineup Details */}
        {selectedLineup && (
          <Card className="mx-auto mt-6 max-w-3xl">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1 h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: selectedLineup.color }}
                  />
                  <div>
                    <CardTitle>{selectedLineup.title}</CardTitle>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        {selectedLineup.profiles?.username || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(selectedLineup.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant={selectedLineup.side === 'T' ? 'default' : 'secondary'}>
                        {selectedLineup.side} Side
                      </Badge>
                    </div>
                  </div>
                </div>
                {user?.id === selectedLineup.user_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDeleteLineup(selectedLineup.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedLineup.description && (
                <div>
                  <h4 className="mb-1 text-sm font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedLineup.description}</p>
                </div>
              )}
              {selectedLineup.throw_instructions && (
                <div>
                  <h4 className="mb-1 text-sm font-medium">Throw Instructions</h4>
                  <p className="text-sm text-muted-foreground">{selectedLineup.throw_instructions}</p>
                </div>
              )}
              {selectedLineup.additional_notes && (
                <div>
                  <h4 className="mb-1 text-sm font-medium">Additional Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedLineup.additional_notes}</p>
                </div>
              )}

              {/* Comments */}
              <div className="border-t border-border pt-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Comments ({selectedLineup.comments?.length || 0})
                </h4>
                
                <div className="space-y-3">
                  {selectedLineup.comments?.map((comment) => (
                    <div key={comment.id} className="rounded-lg bg-secondary p-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {comment.profiles?.username || 'Unknown'}
                        </span>
                        <span>-</span>
                        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-1 text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>

                {user ? (
                  <div className="mt-4 flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      Post
                    </Button>
                  </div>
                ) : (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    <Link href="/auth/login" className="text-primary hover:underline">
                      Sign in
                    </Link>{' '}
                    to add comments
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Lineup Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Lineup</DialogTitle>
            <DialogDescription>
              Add details for your {selectedSide === 'T' ? 'Terrorist' : 'Counter-Terrorist'} side lineup on {map.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., A Site Smoke from T Spawn"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Point Color</Label>
              <Select
                value={formData.color}
                onValueChange={(v) => setFormData({ ...formData, color: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LINEUP_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this lineup do?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="throw_instructions">Throw Instructions</Label>
              <Textarea
                id="throw_instructions"
                placeholder="How to execute this lineup..."
                value={formData.throw_instructions}
                onChange={(e) => setFormData({ ...formData, throw_instructions: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additional_notes">Additional Notes</Label>
              <Textarea
                id="additional_notes"
                placeholder="Any other tips or notes..."
                value={formData.additional_notes}
                onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLineup} disabled={!formData.title.trim()}>
              Create Lineup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
