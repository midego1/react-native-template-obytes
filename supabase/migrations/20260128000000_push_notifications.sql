-- Create push_tokens table
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- Create index for faster lookups
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own push tokens"
  ON push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push tokens"
  ON push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push tokens"
  ON push_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push tokens"
  ON push_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Function to send push notification (calls edge function)
CREATE OR REPLACE FUNCTION send_push_notification(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT '{}'::JSONB,
  p_channel_id TEXT DEFAULT 'default'
)
RETURNS void AS $$
DECLARE
  v_payload JSONB;
BEGIN
  v_payload := jsonb_build_object(
    'userId', p_user_id,
    'title', p_title,
    'body', p_body,
    'data', p_data,
    'channelId', p_channel_id
  );

  -- Call edge function (using pg_net extension if available)
  -- Note: This requires pg_net extension to be enabled
  -- For now, we'll rely on application-level triggers
  -- The actual notification sending will be handled by the app

  RAISE NOTICE 'Notification queued for user %: %', p_user_id, p_title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Notify on new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_sender_name TEXT;
  v_conversation_type TEXT;
BEGIN
  -- Get sender name
  SELECT full_name INTO v_sender_name
  FROM users
  WHERE id = NEW.sender_id;

  -- Get conversation type and recipients
  SELECT type INTO v_conversation_type
  FROM conversations
  WHERE id = NEW.conversation_id;

  -- For direct messages, notify the other participant
  IF v_conversation_type = 'direct' THEN
    FOR v_recipient_id IN
      SELECT user_id
      FROM conversation_participants
      WHERE conversation_id = NEW.conversation_id
      AND user_id != NEW.sender_id
    LOOP
      PERFORM send_push_notification(
        v_recipient_id,
        v_sender_name,
        NEW.content,
        jsonb_build_object(
          'type', 'message',
          'conversationId', NEW.conversation_id,
          'messageId', NEW.id
        ),
        'messages'
      );
    END LOOP;
  -- For group chats, notify all participants except sender
  ELSE
    FOR v_recipient_id IN
      SELECT user_id
      FROM conversation_participants
      WHERE conversation_id = NEW.conversation_id
      AND user_id != NEW.sender_id
    LOOP
      PERFORM send_push_notification(
        v_recipient_id,
        v_sender_name || ' (Group)',
        NEW.content,
        jsonb_build_object(
          'type', 'message',
          'conversationId', NEW.conversation_id,
          'messageId', NEW.id
        ),
        'messages'
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Trigger: Notify on crew request
CREATE OR REPLACE FUNCTION notify_crew_request()
RETURNS TRIGGER AS $$
DECLARE
  v_requester_name TEXT;
BEGIN
  -- Only notify on new pending requests
  IF NEW.status = 'pending' THEN
    -- Get requester name
    SELECT full_name INTO v_requester_name
    FROM users
    WHERE id = NEW.requester_id;

    -- Notify the addressee
    PERFORM send_push_notification(
      NEW.addressee_id,
      'New Crew Request',
      v_requester_name || ' wants to add you to their crew',
      jsonb_build_object(
        'type', 'crew_request',
        'userId', NEW.requester_id,
        'requestId', NEW.id
      ),
      'crew-requests'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_crew_request_sent
  AFTER INSERT ON crew_connections
  FOR EACH ROW
  EXECUTE FUNCTION notify_crew_request();

-- Trigger: Notify on crew request accepted
CREATE OR REPLACE FUNCTION notify_crew_request_accepted()
RETURNS TRIGGER AS $$
DECLARE
  v_addressee_name TEXT;
BEGIN
  -- Only notify when status changes to accepted
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    -- Get addressee name
    SELECT full_name INTO v_addressee_name
    FROM users
    WHERE id = NEW.addressee_id;

    -- Notify the requester
    PERFORM send_push_notification(
      NEW.requester_id,
      'Crew Request Accepted',
      v_addressee_name || ' accepted your crew request',
      jsonb_build_object(
        'type', 'crew_request',
        'userId', NEW.addressee_id,
        'requestId', NEW.id
      ),
      'crew-requests'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_crew_request_accepted
  AFTER UPDATE ON crew_connections
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_crew_request_accepted();
