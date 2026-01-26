import type { Activity } from '@/types/activity';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type CreateActivityData = {
  title: string;
  description?: string;
  category: string;
  location_name: string;
  location_address?: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  starts_at: Date;
  ends_at?: Date;
  is_flexible_time?: boolean;
  max_attendees?: number;
};

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

      // Build insert data
      const insertData: Record<string, unknown> = {
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
      };

      // Add coordinates if available (store as latitude/longitude columns)
      if (data.latitude !== undefined && data.longitude !== undefined) {
        insertData.latitude = data.latitude;
        insertData.longitude = data.longitude;
      }

      // Insert activity
      const { data: activity, error } = await supabase
        .from('activities')
        .insert(insertData)
        .select(
          `
          *,
          host:users!host_id (
            id,
            full_name,
            avatar_url
          )
        `,
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
