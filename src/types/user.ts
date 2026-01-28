/**
 * User Types
 * Extended user type with relationships for crew and chat features
 */

export type User = {
  id: string;
  email: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  current_city?: string;
  current_country?: string;
  created_at: string;
  updated_at?: string;
};

export type UserProfile = {
  // Computed stats
  activities_hosted?: number;
  activities_attended?: number;
  crew_count?: number;

  // Relationships
  is_crew?: boolean;
  crew_status?: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
} & User;

export type UserStats = {
  activities_hosted: number;
  activities_attended: number;
  crew_count: number;
};
