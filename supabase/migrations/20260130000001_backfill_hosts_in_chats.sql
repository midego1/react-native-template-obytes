-- Backfill: Add hosts to existing activity group chats
INSERT INTO conversation_participants (conversation_id, user_id)
SELECT c.id, a.host_id
FROM conversations c
INNER JOIN activities a ON a.id = c.activity_id
WHERE c.type = 'activity_group'
AND NOT EXISTS (
  SELECT 1
  FROM conversation_participants cp
  WHERE cp.conversation_id = c.id
  AND cp.user_id = a.host_id
)
ON CONFLICT (conversation_id, user_id) DO NOTHING;
