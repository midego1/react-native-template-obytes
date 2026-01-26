-- Fix RLS blocking issue for activity group chat creation
-- Create a secure function to create activity chats bypassing RLS

-- Function to create activity group chat (runs with elevated privileges)
CREATE OR REPLACE FUNCTION create_activity_group_chat(activity_uuid UUID, host_uuid UUID)
RETURNS UUID
SECURITY DEFINER -- This allows it to bypass RLS
SET search_path = public
AS $$
DECLARE
  new_conversation_id UUID;
BEGIN
  -- Create conversation
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

-- Now create missing activity chats using the secure function
DO $$
DECLARE
  activity_record RECORD;
BEGIN
  FOR activity_record IN
    SELECT a.id, a.host_id
    FROM activities a
    WHERE NOT EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.activity_id = a.id
      AND c.type = 'activity_group'
    )
  LOOP
    PERFORM create_activity_group_chat(activity_record.id, activity_record.host_id);
  END LOOP;
END $$;

-- Update the trigger to use the new secure function
DROP TRIGGER IF EXISTS on_activity_created ON activities;
DROP FUNCTION IF EXISTS create_activity_conversation();

CREATE OR REPLACE FUNCTION create_activity_conversation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_activity_group_chat(NEW.id, NEW.host_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_activity_created
  AFTER INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_conversation();
