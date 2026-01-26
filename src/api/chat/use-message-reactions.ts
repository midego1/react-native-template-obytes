/**
 * Message Reactions Hooks
 * Add/remove emoji reactions to messages
 */

import type { MessageReaction } from '@/types/chat';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Fetch reactions for a message
 */
export function useMessageReactions(messageId: string) {
  return useQuery({
    queryKey: ['message-reactions', messageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_reactions')
        .select(`
          *,
          user:users!user_id(id, full_name, avatar_url)
        `)
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch reactions: ${error.message}`);
      }

      return data as MessageReaction[];
    },
    enabled: !!messageId,
  });
}

/**
 * Add a reaction to a message
 */
export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        })
        .select()
        .single();

      if (error) {
        // Check if already reacted with this emoji
        if (error.code === '23505') {
          throw new Error('Already reacted with this emoji');
        }
        throw new Error(`Failed to add reaction: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions', variables.messageId] });
    },
  });
}

/**
 * Remove a reaction from a message
 */
export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error('Must be logged in');

      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (error) {
        throw new Error(`Failed to remove reaction: ${error.message}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions', variables.messageId] });
    },
  });
}
