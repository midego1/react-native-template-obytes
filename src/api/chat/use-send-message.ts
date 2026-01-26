import type { MessageType } from '@/types/chat';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type SendMessageParams = {
  conversationId: string;
  content: string;
  type?: MessageType;
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  duration?: number;
  replyToMessageId?: string;
};

/**
 * Send a message in a conversation (text, image, video, audio, file, gif)
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      type = 'text',
      mediaUrl,
      mediaType,
      fileName,
      fileSize,
      thumbnailUrl,
      duration,
      replyToMessageId,
    }: SendMessageParams) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          type,
          media_url: mediaUrl,
          media_type: mediaType,
          file_name: fileName,
          file_size: fileSize,
          thumbnail_url: thumbnailUrl,
          duration,
          reply_to_message_id: replyToMessageId,
          status: 'sent',
        })
        .select()
        .single();

      if (error)
        throw new Error(`Failed to send message: ${error.message}`);

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
