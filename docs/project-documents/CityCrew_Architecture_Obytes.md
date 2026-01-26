# CityCrew Feature Architecture on Obytes Template

## 🎯 Quick Reminder: What is CityCrew?

**Mission:** "Make every solo traveler feel like they have friends in every city"

**Core Features:**
- Activity discovery (happening now / upcoming)
- Create & host activities
- Traveler profiles & "Crew" (friends)
- Real-time chat
- City-based exploration with maps
- "Happening Now" differentiator (activities starting within 2 hours)

---

## 📁 Project Structure (Obytes + CityCrew)

```
citycrew/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Auth group (unauthenticated)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── onboarding.tsx
│   │
│   ├── (tabs)/                   # Main tab navigation (authenticated)
│   │   ├── _layout.tsx           # Tab bar config
│   │   ├── index.tsx             # Home / Activity Feed
│   │   ├── explore.tsx           # Map + Search
│   │   ├── create.tsx            # Create Activity (center tab)
│   │   ├── chats/
│   │   │   ├── index.tsx         # Chat list
│   │   │   └── [conversationId].tsx
│   │   └── profile/
│   │       ├── index.tsx         # My profile
│   │       ├── edit.tsx
│   │       └── settings.tsx
│   │
│   ├── activity/
│   │   ├── [id].tsx              # Activity detail
│   │   └── [id]/
│   │       ├── attendees.tsx
│   │       └── edit.tsx
│   │
│   ├── user/
│   │   └── [id].tsx              # Other user's profile
│   │
│   ├── crew/
│   │   ├── index.tsx             # My crew list
│   │   └── requests.tsx          # Crew requests
│   │
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx
│
├── src/
│   ├── api/                      # API layer (React Query)
│   │   ├── activities/
│   │   │   ├── use-activities.ts
│   │   │   ├── use-activity.ts
│   │   │   ├── use-create-activity.ts
│   │   │   ├── use-join-activity.ts
│   │   │   └── types.ts
│   │   ├── auth/
│   │   │   ├── use-login.ts
│   │   │   ├── use-register.ts
│   │   │   └── use-session.ts
│   │   ├── chat/
│   │   │   ├── use-conversations.ts
│   │   │   ├── use-messages.ts
│   │   │   └── use-send-message.ts
│   │   ├── users/
│   │   │   ├── use-user.ts
│   │   │   ├── use-update-profile.ts
│   │   │   └── use-nearby-users.ts
│   │   ├── crew/
│   │   │   ├── use-crew.ts
│   │   │   ├── use-crew-requests.ts
│   │   │   └── use-add-crew.ts
│   │   └── common/
│   │       ├── client.ts         # Axios instance
│   │       └── query-client.ts
│   │
│   ├── components/
│   │   ├── ui/                   # Base UI (from Obytes)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── text.tsx
│   │   │   ├── image.tsx
│   │   │   └── ...
│   │   │
│   │   ├── activity/
│   │   │   ├── activity-card.tsx
│   │   │   ├── activity-list.tsx
│   │   │   ├── happening-now-badge.tsx
│   │   │   ├── attendee-avatars.tsx
│   │   │   ├── category-pill.tsx
│   │   │   └── activity-form.tsx
│   │   │
│   │   ├── user/
│   │   │   ├── user-avatar.tsx
│   │   │   ├── user-card.tsx
│   │   │   ├── traveler-badge.tsx
│   │   │   └── crew-button.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── conversation-item.tsx
│   │   │   ├── message-bubble.tsx
│   │   │   ├── message-input.tsx
│   │   │   └── typing-indicator.tsx
│   │   │
│   │   ├── map/
│   │   │   ├── activity-map.tsx
│   │   │   ├── activity-marker.tsx
│   │   │   └── user-location-marker.tsx
│   │   │
│   │   └── common/
│   │       ├── glass-card.tsx    # iOS Liquid Glass style
│   │       ├── empty-state.tsx
│   │       ├── error-boundary.tsx
│   │       ├── pull-to-refresh.tsx
│   │       └── skeleton.tsx
│   │
│   ├── core/                     # Core utilities (from Obytes)
│   │   ├── auth/
│   │   │   ├── index.tsx
│   │   │   └── utils.ts
│   │   ├── i18n/
│   │   ├── storage/              # MMKV
│   │   └── env.ts
│   │
│   ├── store/                    # Zustand stores
│   │   ├── auth.ts               # Auth state (from Obytes)
│   │   ├── location.ts           # User location
│   │   ├── filters.ts            # Activity filters
│   │   └── notifications.ts      # Push notification state
│   │
│   ├── hooks/
│   │   ├── use-location.ts
│   │   ├── use-permissions.ts
│   │   ├── use-push-notifications.ts
│   │   └── use-realtime.ts       # Supabase realtime
│   │
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client
│   │   ├── mapbox.ts             # Mapbox config
│   │   └── date.ts               # Date utilities (date-fns)
│   │
│   └── types/
│       ├── activity.ts
│       ├── user.ts
│       ├── chat.ts
│       └── navigation.ts
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── supabase/                     # Supabase local dev
    ├── migrations/
    ├── functions/                # Edge functions
    └── seed.sql
```

---

## 🗄️ Database Schema (Supabase + PostGIS)

```sql
-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ==========================================
-- USERS
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  
  -- Location (current city)
  current_city TEXT,
  current_country TEXT,
  location GEOGRAPHY(POINT, 4326),  -- PostGIS point
  location_updated_at TIMESTAMPTZ,
  
  -- Travel info
  home_country TEXT,
  languages TEXT[],                  -- ['en', 'nl', 'th']
  interests TEXT[],                  -- ['coffee', 'hiking', 'photography']
  travel_style TEXT,                 -- 'backpacker', 'digital_nomad', 'flashpacker'
  
  -- Settings
  is_visible BOOLEAN DEFAULT true,   -- Show on map / nearby
  push_enabled BOOLEAN DEFAULT true,
  
  -- Subscription
  is_premium BOOLEAN DEFAULT false,
  premium_until TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- ACTIVITIES
-- ==========================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,            -- 'coffee', 'food', 'drinks', 'adventure', etc.
  
  -- Location
  location_name TEXT NOT NULL,       -- "Starbucks Reserve Roastery"
  location_address TEXT,
  location GEOGRAPHY(POINT, 4326),
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  
  -- Timing
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  is_flexible_time BOOLEAN DEFAULT false,
  
  -- Capacity
  max_attendees INTEGER,             -- NULL = unlimited
  
  -- Settings
  is_public BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  
  -- Status
  status TEXT DEFAULT 'active',      -- 'active', 'cancelled', 'completed'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Computed column: is_happening_now
CREATE OR REPLACE FUNCTION is_happening_now(activity activities)
RETURNS BOOLEAN AS $$
  SELECT activity.starts_at <= now() + INTERVAL '2 hours'
     AND activity.starts_at >= now() - INTERVAL '1 hour'
     AND activity.status = 'active';
$$ LANGUAGE SQL STABLE;

-- ==========================================
-- ACTIVITY ATTENDEES
-- ==========================================
CREATE TABLE activity_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'joined',      -- 'joined', 'pending', 'declined'
  joined_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(activity_id, user_id)
);

-- ==========================================
-- CREW (Friends)
-- ==========================================
CREATE TABLE crew_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',     -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- ==========================================
-- CONVERSATIONS & MESSAGES
-- ==========================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'direct',        -- 'direct', 'activity_group'
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',          -- 'text', 'image', 'system'
  created_at TIMESTAMPTZ DEFAULT now(),
  edited_at TIMESTAMPTZ
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_activities_location ON activities USING GIST(location);
CREATE INDEX idx_activities_starts_at ON activities(starts_at);
CREATE INDEX idx_activities_city ON activities(city);
CREATE INDEX idx_activities_status ON activities(status);

CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_users_current_city ON users(current_city);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can read public profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (is_visible = true OR id = auth.uid());

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Activities policies
CREATE POLICY "Public activities are viewable by everyone"
  ON activities FOR SELECT
  USING (is_public = true OR host_id = auth.uid());

CREATE POLICY "Authenticated users can create activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update own activities"
  ON activities FOR UPDATE
  USING (host_id = auth.uid());
```

---

## 🔌 Key Integrations to Add

### 1. Supabase (Backend)

```typescript
// src/lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const mmkvStorageAdapter = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: mmkvStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

### 2. Maps (Mapbox or react-native-maps)

```bash
# Option A: Mapbox (better for custom styling)
npx expo install @rnmapbox/maps

# Option B: Google Maps (simpler)
npx expo install react-native-maps
```

### 3. Real-time Chat (Supabase Realtime)

```typescript
// src/hooks/use-realtime.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Optimistically update the cache
          queryClient.setQueryData(
            ['messages', conversationId],
            (old: Message[] = []) => [...old, payload.new as Message]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
}
```

### 4. Push Notifications (Expo)

```bash
npx expo install expo-notifications expo-device
```

### 5. Location

```bash
npx expo install expo-location
```

---

## 📱 Screen-by-Screen Implementation

### Screen 1: Activity Feed (Home Tab)

```typescript
// app/(tabs)/index.tsx
import { useActivities } from '@/api/activities/use-activities';
import { ActivityList } from '@/components/activity/activity-list';
import { FilterBar } from '@/components/activity/filter-bar';
import { useLocationStore } from '@/store/location';
import { useFilterStore } from '@/store/filters';

export default function HomeScreen() {
  const { currentCity } = useLocationStore();
  const { category, timeFilter } = useFilterStore();
  
  const { 
    data: activities, 
    isLoading, 
    refetch,
    isRefetching 
  } = useActivities({
    city: currentCity,
    category,
    timeFilter, // 'happening_now' | 'today' | 'this_week'
  });

  return (
    <View className="flex-1 bg-gray-50">
      <FilterBar />
      
      <ActivityList
        activities={activities}
        isLoading={isLoading}
        onRefresh={refetch}
        isRefreshing={isRefetching}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No activities yet"
            subtitle="Be the first to create one!"
            actionLabel="Create Activity"
            onAction={() => router.push('/create')}
          />
        }
      />
    </View>
  );
}
```

### Screen 2: Activity Card Component

```typescript
// src/components/activity/activity-card.tsx
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { formatRelative } from 'date-fns';
import { Text } from '@/components/ui/text';
import { GlassCard } from '@/components/common/glass-card';
import { HappeningNowBadge } from './happening-now-badge';
import { AttendeeAvatars } from './attendee-avatars';
import { CategoryPill } from './category-pill';
import type { Activity } from '@/types/activity';

interface Props {
  activity: Activity;
}

export function ActivityCard({ activity }: Props) {
  const isHappeningNow = 
    new Date(activity.starts_at) <= new Date(Date.now() + 2 * 60 * 60 * 1000) &&
    new Date(activity.starts_at) >= new Date(Date.now() - 1 * 60 * 60 * 1000);

  return (
    <Pressable onPress={() => router.push(`/activity/${activity.id}`)}>
      <GlassCard className="mb-4 overflow-hidden">
        {/* Host info */}
        <View className="flex-row items-center p-4 pb-2">
          <Image
            source={{ uri: activity.host.avatar_url }}
            className="w-10 h-10 rounded-full"
          />
          <View className="ml-3 flex-1">
            <Text className="font-semibold">{activity.host.full_name}</Text>
            <Text className="text-gray-500 text-sm">
              {formatRelative(new Date(activity.starts_at), new Date())}
            </Text>
          </View>
          {isHappeningNow && <HappeningNowBadge />}
        </View>

        {/* Content */}
        <View className="px-4 pb-3">
          <Text className="text-lg font-bold mb-1">{activity.title}</Text>
          {activity.description && (
            <Text className="text-gray-600 mb-2" numberOfLines={2}>
              {activity.description}
            </Text>
          )}
          
          <View className="flex-row items-center mt-2">
            <CategoryPill category={activity.category} />
            <Text className="text-gray-500 text-sm ml-2">
              📍 {activity.location_name}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between px-4 py-3 border-t border-gray-100">
          <AttendeeAvatars 
            attendees={activity.attendees} 
            max={5}
            count={activity.attendee_count}
          />
          <View className="flex-row">
            <Pressable className="px-4 py-2 bg-indigo-500 rounded-full">
              <Text className="text-white font-semibold">Join</Text>
            </Pressable>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}
```

### Screen 3: Create Activity

```typescript
// app/(tabs)/create.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateActivity } from '@/api/activities/use-create-activity';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { LocationPicker } from '@/components/ui/location-picker';
import { CategorySelector } from '@/components/activity/category-selector';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category: z.string(),
  starts_at: z.date(),
  location_name: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  max_attendees: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateActivityScreen() {
  const { mutate: createActivity, isPending } = useCreateActivity();
  
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      starts_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    },
  });

  const onSubmit = (data: FormData) => {
    createActivity(data, {
      onSuccess: (activity) => {
        router.replace(`/activity/${activity.id}`);
      },
    });
  };

  return (
    <KeyboardAwareScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-6">Create Activity</Text>
        
        {/* Title */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <Input
              label="What's the plan?"
              placeholder="Coffee & coworking"
              value={value}
              onChangeText={onChange}
              error={errors.title?.message}
            />
          )}
        />

        {/* Category */}
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <CategorySelector
              selected={value}
              onSelect={onChange}
            />
          )}
        />

        {/* Date & Time */}
        <Controller
          control={control}
          name="starts_at"
          render={({ field: { onChange, value } }) => (
            <DateTimePicker
              label="When?"
              value={value}
              onChange={onChange}
              minimumDate={new Date()}
            />
          )}
        />

        {/* Location */}
        <Controller
          control={control}
          name="location_name"
          render={({ field: { onChange, value } }) => (
            <LocationPicker
              label="Where?"
              value={value}
              onSelect={(place) => {
                onChange(place.name);
                // Also set coordinates
              }}
            />
          )}
        />

        {/* Max attendees */}
        <Controller
          control={control}
          name="max_attendees"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Max attendees (optional)"
              placeholder="Leave empty for unlimited"
              value={value?.toString()}
              onChangeText={(v) => onChange(v ? parseInt(v) : undefined)}
              keyboardType="numeric"
            />
          )}
        />

        <Button
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
          className="mt-6"
        >
          Create Activity
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}
```

---

## 🎨 Design System (iOS Liquid Glass)

```typescript
// src/components/common/glass-card.tsx
import { View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { cn } from '@/lib/utils';

interface Props extends ViewProps {
  intensity?: number;
}

export function GlassCard({ 
  children, 
  className, 
  intensity = 80,
  ...props 
}: Props) {
  return (
    <View
      className={cn(
        'overflow-hidden rounded-2xl',
        className
      )}
      {...props}
    >
      <BlurView
        intensity={intensity}
        tint="light"
        className="flex-1"
      >
        <View className="bg-white/70 flex-1 border border-white/50">
          {children}
        </View>
      </BlurView>
    </View>
  );
}
```

---

## 🔐 Auth Flow (Extend Obytes)

Obytes already has auth. Extend it for CityCrew:

```typescript
// src/api/auth/use-register.ts
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/core/auth';

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  home_country?: string;
}

export function useRegister() {
  const { signIn } = useAuth();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      
      if (authError) throw authError;

      // 2. Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user!.id,
          email: data.email,
          full_name: data.full_name,
          home_country: data.home_country,
        });

      if (profileError) throw profileError;

      return authData;
    },
    onSuccess: (data) => {
      if (data.session) {
        signIn(data.session.access_token);
      }
    },
  });
}
```

---

## 📦 Additional Packages to Install

```bash
# Core (already in Obytes)
# - expo-router, zustand, react-query, axios, react-hook-form, zod, nativewind

# Add for CityCrew:
npx expo install @supabase/supabase-js react-native-url-polyfill
npx expo install expo-location
npx expo install expo-notifications expo-device
npx expo install expo-blur
npx expo install expo-image
npx expo install @rnmapbox/maps  # or react-native-maps
npx expo install date-fns
npx expo install react-native-reanimated  # for animations
npx expo install @gorhom/bottom-sheet     # for modals
```

---

## 🚀 Development Phases

### Phase 1: Core MVP (Weeks 1-4)
- [ ] Project setup with Obytes template
- [ ] Supabase integration & schema
- [ ] Auth flow (register, login, logout)
- [ ] Activity feed (list, filter)
- [ ] Activity detail screen
- [ ] Create activity
- [ ] Join activity

### Phase 2: Social Features (Weeks 5-8)
- [ ] User profiles
- [ ] Crew system (add friend, requests)
- [ ] Direct messaging (1:1)
- [ ] Activity group chat
- [ ] Push notifications

### Phase 3: Discovery (Weeks 9-12)
- [ ] Map view with activity markers
- [ ] Nearby travelers
- [ ] Location-based search
- [ ] "Happening Now" filter

### Phase 4: Polish & Launch (Weeks 13-16)
- [ ] Onboarding flow
- [ ] Premium features (CityCrew+)
- [ ] App Store submission
- [ ] Play Store submission

---

## 📝 Next Steps

1. **Clone Obytes template:**
   ```bash
   npx create-expo-app CityCrew --template @obytes/expo-template
   ```

2. **Set up Supabase project** at supabase.com

3. **Run the database migrations**

4. **Start building Screen 1: Activity Feed**

Want me to detail any specific part further?
