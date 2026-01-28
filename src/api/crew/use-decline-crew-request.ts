import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Decline a pending crew request (deletes the request)
 */
export function useDeclineCrewRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase.from('crew_connections').delete().eq('id', requestId);

      if (error)
        throw new Error(`Failed to decline request: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-requests'] });
      queryClient.invalidateQueries({ queryKey: ['crew-connection-status'] });
    },
  });
}
