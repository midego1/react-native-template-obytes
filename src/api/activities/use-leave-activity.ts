import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Leave an activity
 */
export function useLeaveActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityId: string) => {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('You must be logged in to leave an activity');
      }

      // Delete attendee record
      const { error } = await supabase
        .from('activity_attendees')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to leave activity: ${error.message}`);
      }

      return { success: true };
    },
    onSuccess: (_, activityId) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['attendee-status', activityId] });
      queryClient.invalidateQueries({ queryKey: ['activity-conversation', activityId] });
    },
  });
}
