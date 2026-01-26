import type { Conversation } from '@/types/chat';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Fetch user's conversations with last message and unread count
 */
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error('Not authenticated');

      // Get user's conversations through participants
      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, last_read_at')
        .eq('user_id', user.id);

      if (participantsError)
        throw new Error(`Failed to fetch conversations: ${participantsError.message}`);

      if (!participants || participants.length === 0)
        return [];

      const conversationIds = participants.map(p => p.conversation_id);

      // Fetch conversations with details
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (conversationsError)
        throw new Error(`Failed to fetch conversations: ${conversationsError.message}`);

      // For each conversation, get last message and other participant
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select(
              `
              *,
              sender:users!sender_id(id, full_name, avatar_url)
            `,
            )
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // For direct messages, get the other participant
          let otherParticipant = null;
          if (conv.type === 'direct') {
            const { data: allParticipants } = await supabase
              .from('conversation_participants')
              .select(
                `
                user:users!user_id(id, full_name, username, avatar_url)
              `,
              )
              .eq('conversation_id', conv.id);

            otherParticipant
              = allParticipants?.find((p: any) => p.user.id !== user.id)?.user || null;
          }

          // For activity groups, get activity title
          let activityTitle = null;
          if (conv.type === 'activity_group' && conv.activity_id) {
            const { data: activity } = await supabase
              .from('activities')
              .select('title')
              .eq('id', conv.activity_id)
              .single();

            activityTitle = activity?.title || null;
          }

          // Calculate unread count
          const participant = participants.find(p => p.conversation_id === conv.id);
          const lastReadAt = participant?.last_read_at;

          let unreadCount = 0;
          if (lastReadAt) {
            const { count } = await supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .gt('created_at', lastReadAt)
              .neq('sender_id', user.id);

            unreadCount = count || 0;
          }

          return {
            ...conv,
            last_message: lastMessage,
            other_participant: otherParticipant,
            activity_title: activityTitle,
            unread_count: unreadCount,
          } as Conversation;
        }),
      );

      return enrichedConversations;
    },
  });
}
