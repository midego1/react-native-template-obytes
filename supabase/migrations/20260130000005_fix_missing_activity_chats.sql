-- Fix: Create missing activity group chats for existing activities
-- This handles activities created before triggers were working

-- First, create conversations for activities that don't have one
INSERT INTO conversations (type, activity_id)
SELECT 'activity_group', a.id
FROM activities a
WHERE NOT EXISTS (
  SELECT 1 FROM conversations c
  WHERE c.activity_id = a.id
  AND c.type = 'activity_group'
)
ON CONFLICT DO NOTHING;

-- Then, add hosts to their activity chats
INSERT INTO conversation_participants (conversation_id, user_id)
SELECT c.id, a.host_id
FROM conversations c
INNER JOIN activities a ON a.id = c.activity_id
WHERE c.type = 'activity_group'
AND NOT EXISTS (
  SELECT 1 FROM conversation_participants cp
  WHERE cp.conversation_id = c.id
  AND cp.user_id = a.host_id
)
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Finally, verify the trigger function is correct
-- Drop and recreate to ensure it's up to date
DROP TRIGGER IF EXISTS on_activity_created ON activities;
DROP FUNCTION IF EXISTS create_activity_conversation();

CREATE OR REPLACE FUNCTION create_activity_conversation()
RETURNS TRIGGER AS $$
DECLARE
  new_conversation_id UUID;
BEGIN
  -- Create the conversation
  INSERT INTO conversations (type, activity_id)
  VALUES ('activity_group', NEW.id)
  RETURNING id INTO new_conversation_id;

  -- Add the host as a participant
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (new_conversation_id, NEW.host_id)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER on_activity_created
  AFTER INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_conversation();
