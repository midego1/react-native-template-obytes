-- Fix conversation lifecycle issues
-- 1. Prevent conversations from being deleted when activities are deleted
-- 2. Add unique constraint to prevent duplicate conversations per activity
-- 3. Clean up duplicate conversations

-- First, let's clean up duplicate conversations (keep the oldest one for each activity)
DELETE FROM conversations c1
WHERE c1.type = 'activity_group'
AND c1.activity_id IS NOT NULL
AND EXISTS (
  SELECT 1 FROM conversations c2
  WHERE c2.type = 'activity_group'
  AND c2.activity_id = c1.activity_id
  AND c2.created_at < c1.created_at
);

-- Add unique constraint to prevent duplicate activity conversations
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_activity_conversation
ON conversations(activity_id)
WHERE type = 'activity_group' AND activity_id IS NOT NULL;

-- Update the create_activity_group_chat function to handle existing conversations
CREATE OR REPLACE FUNCTION create_activity_group_chat(activity_uuid UUID, host_uuid UUID)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_conversation_id UUID;
  new_conversation_id UUID;
BEGIN
  -- Check if conversation already exists
  SELECT id INTO existing_conversation_id
  FROM conversations
  WHERE type = 'activity_group'
  AND activity_id = activity_uuid;

  -- If conversation exists, return it
  IF existing_conversation_id IS NOT NULL THEN
    -- Make sure host is a participant
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (existing_conversation_id, host_uuid)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;

    RETURN existing_conversation_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (type, activity_id)
  VALUES ('activity_group', activity_uuid)
  RETURNING id INTO new_conversation_id;

  -- Add host as participant
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (new_conversation_id, host_uuid)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;

  RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Note: We keep ON DELETE SET NULL as it is in the original schema
-- This means when an activity is deleted, the conversation remains but activity_id becomes NULL
-- The conversation and its messages are preserved for historical purposes
