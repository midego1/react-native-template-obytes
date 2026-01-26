import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Check the connection status between the current user and another user
 * Returns: 'none', 'pending_sent', 'pending_received', or 'accepted'
 */
export function useCrewConnectionStatus(userId: string) {
  return useQuery({
    queryKey: ['crew-connection-status', userId],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error('Not authenticated');

      // Don't check status for self
      if (user.id === userId)
        return 'none';

      const { data, error } = await supabase
        .from('crew_connections')
        .select('id, status, requester_id, addressee_id')
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`,
        )
        .maybeSingle();

      if (error)
        throw new Error(`Failed to check connection: ${error.message}`);

      if (!data)
        return 'none';

      if (data.status === 'accepted')
        return 'accepted';

      // Pending - determine if we sent it or received it
      if (data.requester_id === user.id)
        return 'pending_sent';
      return 'pending_received';
    },
    enabled: !!userId,
  });
}
