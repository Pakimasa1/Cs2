'use client';

import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { ChatMessage } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GlobalChatProps {
  initialMessages: ChatMessage[];
  user: User | null;
  username: string | null;
}

export function GlobalChat({ initialMessages, user, username }: GlobalChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel('global-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload) => {
          // Fetch the full message with profile
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              profiles (id, username, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Auto-scroll to bottom
  useEffect(() => {
  if (scrollRef.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }
}, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || sending) return;

    setSending(true);
    const { error } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
    }

    setNewMessage('');
    setSending(false);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-65px)] max-w-4xl flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Global Chat</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Discuss strategies, share tips, and connect with the community
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No messages yet. Be the first to say something!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = user?.id === message.user_id;
              return (
                <div
                  key={message.id}
                  className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={message.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {(message.profiles?.username || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn('max-w-[70%]', isOwn && 'text-right')}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {message.profiles?.username || 'Unknown'}
                      </span>
                      <span>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div
                      className={cn(
                        'mt-1 inline-block rounded-lg px-3 py-2 text-sm',
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground'
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4">
        {user ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim() || sending}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>{' '}
              to join the conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
