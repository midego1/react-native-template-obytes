import { useMutation } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

/**
 * Register or update user's push notification token
 */
export function useRegisterPushToken() {
  return useMutation({
    mutationFn: async (token: string) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error('Must be logged in');

      // Check if token already exists
      const { data: existing } = await supabase
        .from('push_tokens')
        .select('id')
        .eq('user_id', user.id)
        .eq('token', token)
        .maybeSingle();

      if (existing) {
        // Update last_used_at
        const { error } = await supabase
          .from('push_tokens')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error)
          throw new Error(`Failed to update token: ${error.message}`);
        return;
      }

      // Insert new token
      const { error } = await supabase.from('push_tokens').insert({
        user_id: user.id,
        token,
        platform: Platform.OS,
      });

      if (error)
        throw new Error(`Failed to register token: ${error.message}`);
    },
  });
}
