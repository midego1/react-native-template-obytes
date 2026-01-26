/**
 * Crew (Friend/Connection) Types
 * Based on Supabase crew_connections table
 */

import type { User } from './user';

export type CrewConnectionStatus = 'pending' | 'accepted' | 'declined';

export type CrewConnection = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: CrewConnectionStatus;
  created_at: string;
  accepted_at?: string;

  // Joined relationships
  requester?: User;
  addressee?: User;
};

export type CrewMember = {
  id: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  current_city?: string;
  current_country?: string;
  connected_at: string;
};

export type CrewRequest = {
  id: string;
  requester_id: string;
  addressee_id: string;
  created_at: string;

  // Joined user data
  requester?: User;
  addressee?: User;
};

export type CrewRequestType = 'sent' | 'received';
