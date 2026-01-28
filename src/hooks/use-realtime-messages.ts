import type { Message } from '@/types/chat';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Subscribe to real-time messages for a conversation
 * Automatically updates the messages query cache
 */
export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId)
      return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch sender info for the new message
          const { data: sender } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url, created_at')
            .eq('id', payload.new.sender_id)
            .single();

          const newMessage: Message = {
            ...(payload.new as Message),
            sender: sender || undefined,
          };

          // Update all message queries for this conversation
          queryClient.setQueriesData<Message[]>(
            { queryKey: ['messages', conversationId] },
            (old = []) => [newMessage, ...old],
          );

          // Invalidate conversations to update last message
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
}
