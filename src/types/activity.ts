/**
 * Activity Types
 * Based on Supabase database schema
 */

export interface User {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  current_city?: string;
  current_country?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  host_id: string;
  host?: User; // Joined from users table

  // Basic info
  title: string;
  description?: string;
  category: string;

  // Location
  location_name: string;
  location_address?: string;
  city: string;
  country: string;

  // Timing
  starts_at: string;
  ends_at?: string;
  is_flexible_time: boolean;

  // Capacity
  max_attendees?: number;

  // Settings
  is_public: boolean;
  requires_approval: boolean;

  // Status
  status: 'active' | 'cancelled' | 'completed';

  // Metadata
  created_at: string;
  updated_at: string;

  // Computed fields (from joins)
  attendee_count?: number;
  is_attending?: boolean;
  is_happening_now?: boolean;
}

export interface ActivityAttendee {
  id: string;
  activity_id: string;
  user_id: string;
  status: 'joined' | 'pending' | 'declined';
  joined_at: string;
  user?: User;
}

export type ActivityCategory =
  | 'coffee'
  | 'food'
  | 'drinks'
  | 'nightlife'
  | 'adventure'
  | 'sports'
  | 'culture'
  | 'coworking'
  | 'sightseeing'
  | 'other';

export const ACTIVITY_CATEGORIES: { value: ActivityCategory; label: string; emoji: string }[] = [
  { value: 'coffee', label: 'Coffee', emoji: '☕' },
  { value: 'food', label: 'Food', emoji: '🍽️' },
  { value: 'drinks', label: 'Drinks', emoji: '🍻' },
  { value: 'nightlife', label: 'Nightlife', emoji: '🌃' },
  { value: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { value: 'sports', label: 'Sports', emoji: '⚽' },
  { value: 'culture', label: 'Culture', emoji: '🎭' },
  { value: 'coworking', label: 'Coworking', emoji: '💻' },
  { value: 'sightseeing', label: 'Sightseeing', emoji: '🗺️' },
  { value: 'other', label: 'Other', emoji: '✨' },
];
