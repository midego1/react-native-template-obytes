-- Fix: Add host to activity group chat when activity is created
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
