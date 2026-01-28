-- Fix: Update trigger to use 'attending' status instead of 'joined'
CREATE OR REPLACE FUNCTION add_to_activity_conversation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only add if status is 'attending'
  IF NEW.status = 'attending' THEN
    INSERT INTO conversation_participants (conversation_id, user_id)
    SELECT c.id, NEW.user_id
    FROM conversations c
    WHERE c.activity_id = NEW.activity_id
    AND c.type = 'activity_group'
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Also update status change handler
CREATE OR REPLACE FUNCTION handle_activity_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed from 'attending' to something else, remove from chat
  IF OLD.status = 'attending' AND NEW.status != 'attending' THEN
    DELETE FROM conversation_participants cp
    USING conversations c
    WHERE cp.conversation_id = c.id
    AND c.activity_id = NEW.activity_id
    AND c.type = 'activity_group'
    AND cp.user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
