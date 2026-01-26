-- ==========================================
-- CityCrew Initial Database Schema
-- ==========================================

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ==========================================
-- USERS
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE INDEX idx_activities_host_id ON activities(host_id);

CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_users_current_city ON users(current_city);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_activity_attendees_activity ON activity_attendees(activity_id);
CREATE INDEX idx_activity_attendees_user ON activity_attendees(user_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES - USERS
-- ==========================================

-- Public profiles are viewable by everyone (if visible)
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (is_visible = true OR id = auth.uid());

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Users can insert own profile (for registration)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- ==========================================
-- RLS POLICIES - ACTIVITIES
-- ==========================================

-- Public activities are viewable by everyone
CREATE POLICY "Public activities are viewable by everyone"
  ON activities FOR SELECT
  USING (is_public = true OR host_id = auth.uid());

-- Authenticated users can create activities
CREATE POLICY "Authenticated users can create activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = host_id);

-- Hosts can update own activities
CREATE POLICY "Hosts can update own activities"
  ON activities FOR UPDATE
  USING (host_id = auth.uid());

-- Hosts can delete own activities
CREATE POLICY "Hosts can delete own activities"
  ON activities FOR DELETE
  USING (host_id = auth.uid());

-- ==========================================
-- RLS POLICIES - ACTIVITY ATTENDEES
-- ==========================================

-- Anyone can view attendees of public activities
CREATE POLICY "Anyone can view attendees of public activities"
  ON activity_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM activities
      WHERE id = activity_attendees.activity_id
      AND (is_public = true OR host_id = auth.uid())
    )
  );

-- Users can join activities
CREATE POLICY "Users can join activities"
  ON activity_attendees FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can leave activities they joined
CREATE POLICY "Users can leave activities"
  ON activity_attendees FOR DELETE
  USING (user_id = auth.uid());

-- Hosts can remove attendees from their activities
CREATE POLICY "Hosts can manage attendees"
  ON activity_attendees FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM activities
      WHERE id = activity_attendees.activity_id
      AND host_id = auth.uid()
    )
  );

-- ==========================================
-- RLS POLICIES - CREW CONNECTIONS
-- ==========================================

-- Users can view their own crew connections
CREATE POLICY "Users can view own crew connections"
  ON crew_connections FOR SELECT
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Users can send crew requests
CREATE POLICY "Users can send crew requests"
  ON crew_connections FOR INSERT
  WITH CHECK (requester_id = auth.uid());

-- Users can update crew connections they're part of (accept/decline)
CREATE POLICY "Users can update own crew connections"
  ON crew_connections FOR UPDATE
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Users can delete crew connections they're part of
CREATE POLICY "Users can delete own crew connections"
  ON crew_connections FOR DELETE
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- ==========================================
-- RLS POLICIES - CONVERSATIONS
-- ==========================================

-- Users can view conversations they're part of
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

-- Users can create conversations
CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ==========================================
-- RLS POLICIES - CONVERSATION PARTICIPANTS
-- ==========================================

-- Users can view participants of their conversations
CREATE POLICY "Users can view participants of own conversations"
  ON conversation_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.user_id = auth.uid()
    )
  );

-- Users can join conversations (for group chats)
CREATE POLICY "Users can join conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can leave conversations
CREATE POLICY "Users can leave conversations"
  ON conversation_participants FOR DELETE
  USING (user_id = auth.uid());

-- Users can update their own participant record (last_read_at)
CREATE POLICY "Users can update own participant record"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid());

-- ==========================================
-- RLS POLICIES - MESSAGES
-- ==========================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Users can send messages to their conversations
CREATE POLICY "Users can send messages to own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (sender_id = auth.uid());

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- FUNCTION: Auto-create user profile on signup
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
