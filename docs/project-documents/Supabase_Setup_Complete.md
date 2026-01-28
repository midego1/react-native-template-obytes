# ✅ Supabase Setup Complete

## What Was Configured

### 1. Database Schema
- ✅ Full CityCrew database schema deployed
- ✅ PostGIS extension enabled (for geospatial features)
- ✅ All tables created: users, activities, activity_attendees, crew_connections, conversations, messages
- ✅ Row Level Security (RLS) policies configured
- ✅ Indexes for performance
- ✅ Auto-create user profile trigger (on signup)

### 2. Environment Variables
- ✅ `.env` configured with Supabase URL and publishable key
- ✅ `env.ts` schema updated with Supabase variables

### 3. Supabase Integration
- ✅ Supabase client created at `src/lib/supabase.ts`
- ✅ MMKV storage adapter integrated
- ✅ Auth helpers created at `src/lib/auth/supabase-auth.ts`
- ✅ Login screen updated to use Supabase auth
- ✅ Auth state listener setup in app layout

---

## How Authentication Works Now

### Supabase + Obytes Integration (Option C)

```
User Login Flow:
  1. User enters email/password
  2. loginWithEmail() calls supabase.auth.signInWithPassword()
  3. Supabase returns session (access_token, refresh_token)
  4. Session stored in Obytes auth store (signIn)
  5. User profile auto-created via database trigger
  6. App navigates to home screen
```

### Available Auth Functions

```typescript
// src/lib/auth/supabase-auth.ts

import { loginWithEmail, registerWithEmail, logout } from '@/lib/auth/supabase-auth';

// Login
await loginWithEmail('user@example.com', 'password');

// Register (auto-creates user profile)
await registerWithEmail('user@example.com', 'password', 'Full Name');

// Logout
await logout();

// Get current session
const session = await getSession();

// Get current user
const user = await getCurrentUser();
```

---

## Testing the Setup

### Step 1: Start the Development Server

```bash
npx expo start -c
```

The `-c` flag clears the cache to ensure env variables are loaded.

### Step 2: Create a Test Account

**Option A: Via the App**
1. Open the app
2. Go to Login screen
3. Try logging in (will fail - no user yet)
4. You need to create a user first via Supabase dashboard

**Option B: Via Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/hcwolskmqcqkkrlefaog/auth/users
2. Click "Add user"
3. Enter email and password
4. User profile will be auto-created!

**Option C: Via SQL**
```sql
-- Run this in Supabase SQL Editor
-- This creates both auth user AND profile

-- 1. Create auth user (replace with your email/password)
SELECT auth.signup(
  'test@citycrew.com',
  'password123',
  '{"full_name": "Test User"}'::jsonb
);
```

### Step 3: Test Login
1. Open the app
2. Go to login screen
3. Enter the test credentials
4. Should successfully login and navigate to home

### Step 4: Verify in Database

Check if user profile was created:
```sql
-- Run in Supabase SQL Editor
SELECT id, email, full_name, created_at
FROM users;
```

---

## Troubleshooting

### Issue: "Invalid API key"
- Check `.env` file has correct `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Restart with `npx expo start -c` to reload env vars

### Issue: "Row Level Security policy violation"
- RLS policies are working correctly
- Make sure you're logged in before accessing data
- Check policy definitions in migration file

### Issue: "User profile not created"
- Check if trigger is enabled: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Manually create profile if needed:
  ```sql
  INSERT INTO users (id, email, full_name)
  VALUES ('user-uuid-here', 'email@example.com', 'Full Name');
  ```

### Issue: "Can't find module ./env"
- This is a TypeScript compilation issue
- Run `npx expo start -c` to rebuild
- If persists, check `tsconfig.json` paths

---

## Next Steps: Phase 1 Implementation

Now that Supabase is set up, you can start building Phase 1 features:

### Phase 1: Core MVP (4-6 weeks)
- [ ] Create user registration screen
- [ ] Build activity feed (list view)
- [ ] Create activity detail screen
- [ ] Build "Create Activity" form
- [ ] Implement "Join Activity" feature
- [ ] Add basic user profile screen

### API Hooks to Create

```typescript
// src/api/activities/use-activities.ts
export function useActivities(city?: string) {
  return useQuery({
    queryKey: ['activities', city],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*, host:users(*), attendees:activity_attendees(count)')
        .eq('city', city)
        .eq('status', 'active')
        .order('starts_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// src/api/activities/use-create-activity.ts
export function useCreateActivity() {
  return useMutation({
    mutationFn: async (activity) => {
      const { data, error } = await supabase
        .from('activities')
        .insert(activity)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}
```

---

## Database Schema Overview

### Tables Created
1. **users** - User profiles (auto-created on signup)
2. **activities** - Events/activities
3. **activity_attendees** - Join table for attendees
4. **crew_connections** - Friend system
5. **conversations** - Chat conversations
6. **conversation_participants** - Conversation members
7. **messages** - Chat messages

### Key Features
- PostGIS for geospatial queries
- Full-text search ready
- RLS policies for security
- Automatic timestamps (created_at, updated_at)
- Computed column: `is_happening_now()`

---

## Files Modified/Created

### Created
- `supabase/migrations/20260126000000_initial_schema.sql` - Full database schema
- `src/lib/supabase.ts` - Supabase client
- `src/lib/auth/supabase-auth.ts` - Auth integration helpers

### Modified
- `.env` - Added Supabase credentials
- `env.ts` - Added Supabase to env schema
- `src/features/auth/login-screen.tsx` - Updated to use Supabase
- `src/app/_layout.tsx` - Added auth listener

---

## Important Notes

1. **RLS is ENABLED** - All tables require authentication for access
2. **User profiles auto-create** - When user signs up via Supabase Auth
3. **Tokens sync automatically** - Supabase session syncs with Obytes store
4. **Auth state persists** - Stored in MMKV, survives app restart

Ready to start building Phase 1! 🚀
