import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Env from 'env';
import { storage } from '@/lib/storage';

// MMKV storage adapter for Supabase
const supabaseStorage = {
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.remove(key);
  },
};

// Create Supabase client with MMKV storage
export const supabase = createClient(
  Env.EXPO_PUBLIC_SUPABASE_URL,
  Env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: supabaseStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
