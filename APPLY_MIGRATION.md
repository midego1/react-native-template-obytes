# Apply Migration to Fix Conversation Issues

## Issue
- Conversations are being created multiple times for the same activity
- Need to ensure conversations are never deleted even if activity is deleted
- Need to ensure chat is created automatically when activity is created

## Steps to Apply Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the contents of: `supabase/migrations/20260131000000_fix_conversation_lifecycle.sql`
6. Click "Run" to execute the migration

## What This Migration Does

1. **Cleans up duplicate conversations** - Deletes duplicate conversations for the same activity (keeps the oldest one)
2. **Adds unique constraint** - Prevents multiple conversations from being created for the same activity
3. **Updates create function** - Makes the function check for existing conversations first
4. **Preserves conversations** - The schema already uses ON DELETE SET NULL, so conversations are preserved even if the activity is deleted

## After Migration

Restart your app and test:
1. Create a new activity → Should automatically create a chat
2. Join an activity → Should show the chat button
3. Leave and rejoin → Should still show the same chat
4. No duplicate conversations should be created
