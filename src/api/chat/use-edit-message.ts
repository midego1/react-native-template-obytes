/**
 * Edit Message Hook
 * Update message content and set edited_at timestamp
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useEditMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Must be logged in');
      }

      // Update the message
      const { data, error } = await supabase
        .from('messages')
        .update({
          content,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('sender_id', user.id) // Ensure user can only edit their own messages
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to edit message: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate the messages query to refetch
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] });
    },
  });
}
