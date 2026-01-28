import type { UserProfile } from '@/types/user';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Fetch a user profile by ID
 * Includes user stats (activities hosted/attended, crew count)
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      // Fetch user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        throw new Error(`Failed to fetch user: ${userError.message}`);
      }

      if (!user) {
        throw new Error('User not found');
      }

      // Fetch stats
      const [hostedCount, attendedCount, crewCount] = await Promise.all([
        // Activities hosted
        supabase
          .from('activities')
          .select('id', { count: 'exact', head: true })
          .eq('host_id', userId)
          .then(res => res.count || 0),

        // Activities attended
        supabase
          .from('activity_attendees')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'joined')
          .then(res => res.count || 0),

        // Crew connections
        supabase
          .from('crew_connections')
          .select('id', { count: 'exact', head: true })
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
          .eq('status', 'accepted')
          .then(res => res.count || 0),
      ]);

      const profile: UserProfile = {
        ...user,
        activities_hosted: hostedCount,
        activities_attended: attendedCount,
        crew_count: crewCount,
      };

      return profile;
    },
    enabled: !!userId,
  });
}
