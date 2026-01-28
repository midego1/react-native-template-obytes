-- Backfill: Add existing attendees to activity group chats
INSERT INTO conversation_participants (conversation_id, user_id)
SELECT c.id, aa.user_id
FROM conversations c
INNER JOIN activity_attendees aa ON aa.activity_id = c.activity_id
WHERE c.type = 'activity_group'
AND aa.status = 'attending'
AND NOT EXISTS (
  SELECT 1
  FROM conversation_participants cp
  WHERE cp.conversation_id = c.id
  AND cp.user_id = aa.user_id
)
ON CONFLICT (conversation_id, user_id) DO NOTHING;
