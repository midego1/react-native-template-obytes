import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Activity } from '@/types/activity';

export interface CreateActivityData {
  title: string;
  description?: string;
  category: string;
  location_name: string;
  location_address?: string;
  city: string;
  country: string;
  starts_at: Date;
  ends_at?: Date;
  is_flexible_time?: boolean;
  max_attendees?: number;
}

/**
 * Create a new activity
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateActivityData) => {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('You must be logged in to create an activity');
      }

      // Insert activity
      const { data: activity, error } = await supabase
        .from('activities')
        .insert({
          host_id: user.id,
          title: data.title,
          description: data.description,
          category: data.category,
          location_name: data.location_name,
          location_address: data.location_address,
          city: data.city,
          country: data.country,
          starts_at: data.starts_at.toISOString(),
          ends_at: data.ends_at?.toISOString(),
          is_flexible_time: data.is_flexible_time || false,
          max_attendees: data.max_attendees,
          is_public: true,
          status: 'active',
        })
        .select(
          `
          *,
          host:users!host_id (
            id,
            full_name,
            avatar_url
          )
        `
        )
        .single();

      if (error) {
        throw new Error(`Failed to create activity: ${error.message}`);
      }

      return activity as Activity;
    },
    onSuccess: () => {
      // Invalidate activities query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
