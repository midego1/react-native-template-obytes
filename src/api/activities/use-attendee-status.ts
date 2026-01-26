import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Check if current user is attending an activity
 */
export function useAttendeeStatus(activityId: string) {
  return useQuery({
    queryKey: ['attendee-status', activityId],
    queryFn: async () => {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return { isAttending: false, isHost: false };
      }

      // Check if user is attending
      const { data: attendee } = await supabase
        .from('activity_attendees')
        .select('id, status')
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .single();

      // Check if user is the host
      const { data: activity } = await supabase
        .from('activities')
        .select('host_id')
        .eq('id', activityId)
        .single();

      return {
        isAttending: attendee?.status === 'joined',
        isHost: activity?.host_id === user.id,
      };
    },
    enabled: !!activityId,
  });
}
