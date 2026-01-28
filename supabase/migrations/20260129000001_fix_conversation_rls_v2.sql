-- Better fix for conversation_participants RLS policy
-- Use a security definer function to break the recursion

-- Drop the existing policy again
DROP POLICY IF EXISTS "Users can view participants of own conversations" ON conversation_participants;

-- Create a security definer function to check if user is in conversation
CREATE OR REPLACE FUNCTION is_conversation_participant(conversation_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = conversation_uuid
    AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the policy using the function
-- This breaks the recursion because the function is SECURITY DEFINER
CREATE POLICY "Users can view participants of own conversations"
  ON conversation_participants FOR SELECT
  USING (
    -- Direct check: user is viewing their own participant record
    user_id = auth.uid()
    OR
    -- Or: user is in the same conversation
    is_conversation_participant(conversation_id, auth.uid())
  );
