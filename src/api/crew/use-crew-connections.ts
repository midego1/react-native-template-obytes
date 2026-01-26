import type { CrewConnection, CrewMember } from '@/types/crew';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Fetch the current user's crew connections (accepted only)
 * Returns list of crew members with their profile info
 */
export function useCrewConnections() {
  return useQuery({
    queryKey: ['crew-connections'],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('crew_connections')
        .select(
          `
          *,
          requester:users!requester_id(id, full_name, username, avatar_url, current_city, current_country),
          addressee:users!addressee_id(id, full_name, username, avatar_url, current_city, current_country)
        `,
        )
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('accepted_at', { ascending: false });

      if (error)
        throw new Error(`Failed to fetch crew: ${error.message}`);

      // Transform to CrewMember format (get the other person)
      const crewMembers: CrewMember[] = (data as CrewConnection[]).map((connection) => {
        const otherUser
          = connection.requester_id === user.id ? connection.addressee : connection.requester;

        return {
          id: otherUser!.id,
          full_name: otherUser!.full_name,
          username: otherUser!.username,
          avatar_url: otherUser!.avatar_url,
          current_city: otherUser!.current_city,
          current_country: otherUser!.current_country,
          connected_at: connection.accepted_at || connection.created_at,
        };
      });

      return crewMembers;
    },
  });
}
