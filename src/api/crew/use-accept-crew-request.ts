import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Accept a pending crew request
 */
export function useAcceptCrewRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('crew_connections')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error)
        throw new Error(`Failed to accept request: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-requests'] });
      queryClient.invalidateQueries({ queryKey: ['crew-connections'] });
      queryClient.invalidateQueries({ queryKey: ['crew-connection-status'] });
    },
  });
}
