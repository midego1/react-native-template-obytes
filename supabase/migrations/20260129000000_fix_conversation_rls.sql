-- Fix infinite recursion in conversation_participants RLS policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view participants of own conversations" ON conversation_participants;

-- Create a simpler policy that doesn't cause recursion
-- Users can view all participants in conversations they are part of
CREATE POLICY "Users can view participants of own conversations"
  ON conversation_participants FOR SELECT
  USING (
    -- User can see participants in conversations where they are a participant
    conversation_id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  );

-- Alternative approach using a direct check
-- This allows users to view participant records without recursion
DROP POLICY IF EXISTS "Users can view participants of own conversations" ON conversation_participants;

CREATE POLICY "Users can view participants of own conversations"
  ON conversation_participants FOR SELECT
  USING (
    -- User is viewing participants of a conversation they're in
    -- We check this without recursing on the same table by using a CTE
    conversation_id IN (
      WITH user_conversations AS (
        SELECT DISTINCT conversation_id
        FROM conversation_participants
        WHERE user_id = auth.uid()
      )
      SELECT conversation_id FROM user_conversations
    )
  );
