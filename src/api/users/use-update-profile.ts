import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type UpdateProfileData = {
  full_name?: string;
  bio?: string;
  current_city?: string;
  current_country?: string;
  avatar_url?: string;
};

/**
 * Update current user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('You must be logged in to update your profile');
      }

      // Update profile
      const { data: profile, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      return profile;
    },
    onSuccess: () => {
      // Invalidate user profile query to refetch
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}
