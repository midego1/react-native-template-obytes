import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Fetch or create activity group conversation
 * Returns the conversation if user is an attendee, null otherwise
 */
export function useActivityConversation(activityId: string) {
  return useQuery({
    queryKey: ['activity-conversation', activityId],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error('Not authenticated');

      // Check if user is the host of this activity
      const { data: activity, error: activityError } = await supabase
        .from('activities')
        .select('host_id')
        .eq('id', activityId)
        .single();

      if (activityError)
        throw new Error(`Failed to fetch activity: ${activityError.message}`);

      const isHost = activity.host_id === user.id;

      console.log('[useActivityConversation] User ID:', user.id, 'Activity ID:', activityId, 'Is Host:', isHost);

      // Check if user is attending this activity
      const { data: attendee, error: attendeeError } = await supabase
        .from('activity_attendees')
        .select('id, status')
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .eq('status', 'joined')
        .maybeSingle();

      if (attendeeError)
        throw new Error(`Failed to check attendance: ${attendeeError.message}`);

      console.log('[useActivityConversation] Attendee record:', attendee);

      // User is not host and not attending - no access to group chat
      if (!isHost && !attendee) {
        console.log('[useActivityConversation] User is not host and not attending - returning null');
        return null;
      }

      // Find or create conversation for this activity
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('type', 'activity_group')
        .eq('activity_id', activityId)
        .maybeSingle();

      if (convError)
        throw new Error(`Failed to fetch conversation: ${convError.message}`);

      console.log('[useActivityConversation] Existing conversation:', conversation);

      // If conversation doesn't exist, create it using the secure function
      if (!conversation) {
        console.log('[useActivityConversation] Creating new conversation...');

        // Use the secure function to create the conversation
        const { data: newConvId, error: createError } = await supabase
          .rpc('create_activity_group_chat', {
            activity_uuid: activityId,
            host_uuid: activity.host_id,
          });

        if (createError)
          throw new Error(`Failed to create conversation: ${createError.message}`);

        console.log('[useActivityConversation] Created conversation:', newConvId);

        // Add current user as participant if not the host (do this BEFORE fetching)
        if (user.id !== activity.host_id) {
          const { error: partError } = await supabase.from('conversation_participants').insert({
            conversation_id: newConvId,
            user_id: user.id,
          });

          if (partError) {
            console.error('[useActivityConversation] Error adding participant:', partError);
          } else {
            console.log('[useActivityConversation] Added user as participant');
          }
        }

        // Now fetch the conversation (we should be able to see it since we're a participant)
        const { data: newConversation, error: fetchError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', newConvId)
          .single();

        if (fetchError || !newConversation) {
          console.error('[useActivityConversation] Failed to fetch conversation:', fetchError);
          throw new Error('Failed to fetch created conversation');
        }

        return newConversation;
      }

      // Check if user is already a participant
      const { data: participant } = await supabase
        .from('conversation_participants')
        .select('id')
        .eq('conversation_id', conversation.id)
        .eq('user_id', user.id)
        .maybeSingle();

      // Add user as participant if not already
      if (!participant) {
        console.log('[useActivityConversation] Adding user as participant...');
        const { error: partError } = await supabase.from('conversation_participants').insert({
          conversation_id: conversation.id,
          user_id: user.id,
        });

        if (partError) {
          console.error('[useActivityConversation] Error adding participant:', partError);
        } else {
          console.log('[useActivityConversation] Added user as participant');
        }
      } else {
        console.log('[useActivityConversation] User is already a participant');
      }

      return conversation;
    },
    enabled: !!activityId,
  });
}
