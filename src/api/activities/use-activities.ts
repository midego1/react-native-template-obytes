import type { Activity } from '@/types/activity';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type UseActivitiesOptions = {
  city?: string;
  category?: string;
  status?: 'active' | 'cancelled' | 'completed';
  limit?: number;
};

/**
 * Fetch activities from Supabase
 * Includes host information and attendee count
 */
export function useActivities(options: UseActivitiesOptions = {}) {
  const { city, category, status = 'active', limit = 50 } = options;

  return useQuery({
    queryKey: ['activities', { city, category, status, limit }],
    queryFn: async () => {
      let query = supabase
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
            current_city,
            current_country
          ),
          attendees:activity_attendees!activity_id (
            status
          )
        `,
          { count: 'exact' },
        )
        .eq('status', status)
        .eq('is_public', true)
        .order('starts_at', { ascending: true })
        .limit(limit);

      // Filter by city if provided
      if (city) {
        query = query.eq('city', city);
      }

      // Filter by category if provided
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch activities: ${error.message}`);
      }

      // Transform the data to match our Activity type
      const activities: Activity[] = (data || []).map(activity => ({
        ...activity,
        // Count only 'joined' attendees + host (1)
        attendee_count: (activity.attendees?.filter((a: any) => a.status === 'joined').length || 0) + 1,
        is_happening_now: isHappeningNow(activity.starts_at),
      }));

      return {
        activities,
        count: count || 0,
      };
    },
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
