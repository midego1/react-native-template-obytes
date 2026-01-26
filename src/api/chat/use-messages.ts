import type { Message } from '@/types/chat';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Fetch messages for a conversation
 * Supports pagination with limit/offset
 */
export function useMessages(conversationId: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['messages', conversationId, limit, offset],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          *,
          sender:users!sender_id(id, full_name, avatar_url)
        `,
        )
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error)
        throw new Error(`Failed to fetch messages: ${error.message}`);

      return (data || []) as Message[];
    },
    enabled: !!conversationId,
  });
}
