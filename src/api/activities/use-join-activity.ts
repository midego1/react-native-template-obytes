import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Join an activity
 */
export function useJoinActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityId: string) => {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('You must be logged in to join an activity');
      }

      // Check if already attending
      const { data: existingAttendee } = await supabase
        .from('activity_attendees')
        .select('id, status')
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingAttendee && existingAttendee.status === 'joined') {
        throw new Error('You are already attending this activity');
      }

      // Check if activity is full
      const { data: activity } = await supabase
        .from('activities')
        .select('max_attendees, status')
        .eq('id', activityId)
        .single();

      if (!activity) {
        throw new Error('Activity not found');
      }

      if (activity.status !== 'active') {
        throw new Error('This activity is no longer active');
      }

      if (activity.max_attendees) {
        const { count } = await supabase
          .from('activity_attendees')
          .select('*', { count: 'exact', head: true })
          .eq('activity_id', activityId)
          .eq('status', 'joined');

        if (count !== null && count >= activity.max_attendees) {
          throw new Error('This activity is full');
        }
      }

      // Join activity
      const { data: attendee, error } = await supabase
        .from('activity_attendees')
        .insert({
          activity_id: activityId,
          user_id: user.id,
          status: 'joined',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to join activity: ${error.message}`);
      }

      return attendee;
    },
    onSuccess: (_, activityId) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['attendee-status', activityId] });
      // Invalidate activity conversation to show chat button
      queryClient.invalidateQueries({ queryKey: ['activity-conversation', activityId] });
    },
  });
}
