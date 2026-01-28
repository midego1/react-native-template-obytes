-- Auto-create conversation when activity is created
CREATE OR REPLACE FUNCTION create_activity_conversation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO conversations (type, activity_id)
  VALUES ('activity_group', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_activity_created
  AFTER INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_conversation();

-- Auto-add participant when joining activity
CREATE OR REPLACE FUNCTION add_to_activity_conversation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only add if status is 'joined'
  IF NEW.status = 'joined' THEN
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

CREATE TRIGGER on_activity_joined
  AFTER INSERT OR UPDATE ON activity_attendees
  FOR EACH ROW
  EXECUTE FUNCTION add_to_activity_conversation();

-- Auto-remove participant when leaving activity
CREATE OR REPLACE FUNCTION remove_from_activity_conversation()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM conversation_participants cp
  USING conversations c
  WHERE cp.conversation_id = c.id
  AND c.activity_id = OLD.activity_id
  AND c.type = 'activity_group'
  AND cp.user_id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_activity_left
  AFTER DELETE ON activity_attendees
  FOR EACH ROW
  EXECUTE FUNCTION remove_from_activity_conversation();

-- Also remove when status changes from 'joined' to something else
CREATE OR REPLACE FUNCTION handle_activity_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed from 'joined' to something else, remove from chat
  IF OLD.status = 'joined' AND NEW.status != 'joined' THEN
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

CREATE TRIGGER on_activity_status_changed
  AFTER UPDATE ON activity_attendees
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_activity_status_change();
