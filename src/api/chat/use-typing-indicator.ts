/**
 * Typing Indicator Hooks
 * Show when users are typing in a conversation
 */

import type { TypingIndicator } from '@/types/chat';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Fetch who is typing in a conversation (excluding current user)
 */
export function useTypingIndicators(conversationId: string) {
  return useQuery({
    queryKey: ['typing-indicators', conversationId],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        return [];

      const { data, error } = await supabase
        .from('typing_indicators')
        .select(`
          *,
          user:users!user_id(id, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .neq('user_id', user.id) // Exclude current user
        .gte('started_at', new Date(Date.now() - 10000).toISOString()); // Only last 10 seconds

      if (error) {
        throw new Error(`Failed to fetch typing indicators: ${error.message}`);
      }

      return data as TypingIndicator[];
    },
    enabled: !!conversationId,
    refetchInterval: 2000, // Poll every 2 seconds
  });
}

/**
 * Set typing status (upsert - insert or update started_at)
 */
export function useSetTyping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error('Must be logged in');

      const { error } = await supabase
        .from('typing_indicators')
        .upsert(
          {
            conversation_id: conversationId,
            user_id: user.id,
            started_at: new Date().toISOString(),
          },
          {
            onConflict: 'conversation_id,user_id',
          },
        );

      if (error) {
        throw new Error(`Failed to set typing: ${error.message}`);
      }
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['typing-indicators', conversationId] });
    },
  });
}

/**
 * Clear typing status
 */
export function useClearTyping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error('Must be logged in');

      const { error } = await supabase
        .from('typing_indicators')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to clear typing: ${error.message}`);
      }
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['typing-indicators', conversationId] });
    },
  });
}
