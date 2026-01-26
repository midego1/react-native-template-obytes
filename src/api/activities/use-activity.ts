import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Activity } from '@/types/activity';

/**
 * Fetch a single activity by ID
 * Includes host information and attendee list
 */
export function useActivity(activityId: string) {
  return useQuery({
    queryKey: ['activity', activityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select(
          `
          *,
          host:users!host_id (
            id,
            email,
            full_name,
            username,
            avatar_url,
            bio,
            current_city,
            current_country
          ),
          attendees:activity_attendees!activity_id (
            id,
            user_id,
            status,
            joined_at,
            user:users!user_id (
              id,
              full_name,
              username,
              avatar_url
            )
          )
        `
        )
        .eq('id', activityId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch activity: ${error.message}`);
      }

      if (!data) {
        throw new Error('Activity not found');
      }

      // Transform the data
      const activity: Activity = {
        ...data,
        attendee_count: data.attendees?.filter((a: any) => a.status === 'joined').length || 0,
        is_happening_now: isHappeningNow(data.starts_at),
      };

      return activity;
    },
    enabled: !!activityId,
  });
}

/**
 * Check if an activity is happening now (within 2 hours)
 */
function isHappeningNow(startsAt: string): boolean {
  const now = new Date();
  const activityTime = new Date(startsAt);
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);

  return activityTime <= twoHoursFromNow && activityTime >= oneHourAgo;
}
