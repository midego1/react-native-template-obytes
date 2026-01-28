import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Send a crew request to another user
 */
export function useSendCrewRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addresseeId: string) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error('Must be logged in');

      // Check if connection already exists
      const { data: existing } = await supabase
        .from('crew_connections')
        .select('id, status')
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`,
        )
        .maybeSingle();

      if (existing) {
        throw new Error(
          existing.status === 'pending' ? 'Request already sent' : 'Already connected',
        );
      }

      const { data, error } = await supabase
        .from('crew_connections')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending',
        })
        .select()
        .single();

      if (error)
        throw new Error(`Failed to send request: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-requests'] });
      queryClient.invalidateQueries({ queryKey: ['crew-connection-status'] });
    },
  });
}
