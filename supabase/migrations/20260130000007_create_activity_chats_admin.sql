-- Create activity group chats as admin (bypassing RLS)
-- This runs with superuser privileges during migration

-- Temporarily disable RLS to create conversations
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;

-- Create conversations for all activities that don't have one
INSERT INTO conversations (type, activity_id)
SELECT 'activity_group', a.id
FROM activities a
WHERE NOT EXISTS (
  SELECT 1 FROM conversations c
  WHERE c.activity_id = a.id
  AND c.type = 'activity_group'
);

-- Add hosts as participants
INSERT INTO conversation_participants (conversation_id, user_id)
SELECT c.id, a.host_id
FROM conversations c
INNER JOIN activities a ON a.id = c.activity_id
WHERE c.type = 'activity_group'
AND NOT EXISTS (
  SELECT 1 FROM conversation_participants cp
  WHERE cp.conversation_id = c.id
  AND cp.user_id = a.host_id
);

-- Re-enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
