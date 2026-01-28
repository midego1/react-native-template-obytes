import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Create a new direct conversation with another user
 * Returns existing conversation if one already exists
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error('Must be logged in');

      // Check if conversation already exists between these users
      const { data: existingParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (existingParticipants && existingParticipants.length > 0) {
        const conversationIds = existingParticipants.map(p => p.conversation_id);

        // Check which of these conversations include the other user
        const { data: otherUserParticipants } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', otherUserId)
          .in('conversation_id', conversationIds);

        if (otherUserParticipants && otherUserParticipants.length > 0) {
          // Conversation exists - verify it's a direct conversation
          const { data: conversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', otherUserParticipants[0].conversation_id)
            .eq('type', 'direct')
            .single();

          if (conversation) {
            return conversation;
          }
        }
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
        })
        .select()
        .single();

      if (convError)
        throw new Error(`Failed to create conversation: ${convError.message}`);

      // Add both participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: conversation.id,
            user_id: user.id,
          },
          {
            conversation_id: conversation.id,
            user_id: otherUserId,
          },
        ]);

      if (participantsError)
        throw new Error(`Failed to add participants: ${participantsError.message}`);

      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
