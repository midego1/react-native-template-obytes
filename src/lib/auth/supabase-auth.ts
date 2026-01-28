import type { TokenType } from './utils';
import { signIn as storeSignIn, signOut as storeSignOut } from '@/features/auth/use-auth-store';
import { supabase } from '@/lib/supabase';

/**
 * Login with email and password using Supabase
 * Automatically stores session in Obytes auth store
 */
export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error)
    throw error;

  if (data.session) {
    // Store Supabase session in Obytes auth store
    const tokens: TokenType = {
      access: data.session.access_token,
      refresh: data.session.refresh_token,
    };
    storeSignIn(tokens);
  }

  return data;
}

export type RegisterData = {
  email: string;
  password: string;
  fullName: string;
  profileData?: {
    current_city?: string;
    current_country?: string;
    bio?: string;
  };
};

/**
 * Register new user with email and password
 * Automatically creates user profile via database trigger and updates with additional data
 */
export async function registerWithEmail(userData: RegisterData) {
  const { email, password, fullName, profileData } = userData;
  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error)
    throw error;

  // Update the user profile with additional data if provided
  if (data.user && profileData) {
    const { error: profileError } = await supabase
      .from('users')
      .update({
        current_city: profileData.current_city,
        current_country: profileData.current_country,
        bio: profileData.bio,
      })
      .eq('id', data.user.id);

    if (profileError) {
      console.error('Failed to update user profile:', profileError);
      // Don't throw error here - registration was successful, profile update can be done later
    }
  }

  if (data.session) {
    // Store Supabase session in Obytes auth store
    const tokens: TokenType = {
      access: data.session.access_token,
      refresh: data.session.refresh_token,
    };
    storeSignIn(tokens);
  }

  return data;
}

/**
 * Sign out from Supabase and clear Obytes auth store
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error)
    throw error;

  // Clear Obytes auth store
  storeSignOut();
}

/**
 * Get current Supabase session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error)
    throw error;
  return data.session;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error)
    throw error;
  return data.user;
}

/**
 * Refresh the current session
 */
export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error)
    throw error;

  if (data.session) {
    // Update Obytes auth store with new tokens
    const tokens: TokenType = {
      access: data.session.access_token,
      refresh: data.session.refresh_token,
    };
    storeSignIn(tokens);
  }

  return data.session;
}

/**
 * Initialize auth state on app startup
 * Checks for existing Supabase session and syncs with Obytes store
 */
export async function initializeAuth() {
  try {
    const session = await getSession();

    if (session) {
      // Sync existing session with Obytes store
      const tokens: TokenType = {
        access: session.access_token,
        refresh: session.refresh_token,
      };
      storeSignIn(tokens);
      return session;
    }
    else {
      storeSignOut();
      return null;
    }
  }
  catch (error) {
    console.error('Failed to initialize auth:', error);
    storeSignOut();
    return null;
  }
}

/**
 * Setup Supabase auth state change listener
 * Syncs Supabase auth state with Obytes store automatically
 */
export function setupAuthListener() {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (session) {
        const tokens: TokenType = {
          access: session.access_token,
          refresh: session.refresh_token,
        };
        storeSignIn(tokens);
      }
      else {
        storeSignOut();
      }
    },
  );

  return subscription;
}
