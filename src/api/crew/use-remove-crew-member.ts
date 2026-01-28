import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Remove a crew member (deletes the connection)
 */
export function useRemoveCrewMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error('Must be logged in');

      const { error } = await supabase
        .from('crew_connections')
        .delete()
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`,
        );

      if (error)
        throw new Error(`Failed to remove crew member: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-connections'] });
      queryClient.invalidateQueries({ queryKey: ['crew-connection-status'] });
    },
  });
}
