import type { CrewRequest } from '@/types/crew';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Fetch pending crew requests (both sent and received)
 */
export function useCrewRequests() {
  return useQuery({
    queryKey: ['crew-requests'],
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
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error)
        throw new Error(`Failed to fetch requests: ${error.message}`);

      return {
        sent: (data as CrewRequest[]).filter(r => r.requester_id === user.id),
        received: (data as CrewRequest[]).filter(r => r.addressee_id === user.id),
      };
    },
  });
}
