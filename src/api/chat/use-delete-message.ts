/**
 * Delete Message Hook
 * Soft delete message by setting deleted_at timestamp
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Must be logged in');
      }

      // Soft delete the message
      const { data, error } = await supabase
        .from('messages')
        .update({
          deleted_at: new Date().toISOString(),
          content: 'Message deleted', // Keep minimal content for history
        })
        .eq('id', messageId)
        .eq('sender_id', user.id) // Ensure user can only delete their own messages
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the messages query to refetch
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    },
  });
}
