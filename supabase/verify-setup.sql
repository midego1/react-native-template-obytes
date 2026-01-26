-- ============================================
-- VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to verify setup
-- ============================================

-- Check if PostGIS is enabled
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'postgis';
-- Expected: 1 row with postgis extension

-- List all tables in public schema
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Expected: activities, activity_attendees, conversation_participants,
--           conversations, crew_connections, messages, users

-- Check if user profile trigger exists
SELECT tgname, proname
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';
-- Expected: 1 row showing the trigger

-- Check if test user exists in auth
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'test@citycrew.com';
-- Expected: 1 row if you created the test user

-- Check if user profile was auto-created
SELECT id, email, full_name, created_at
FROM users
WHERE email = 'test@citycrew.com';
-- Expected: 1 row if trigger worked, 0 rows if not

-- Count RLS policies
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
-- Expected: Multiple policies for each table

-- Verify indexes exist
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
-- Expected: Multiple indexes including GIST indexes for location fields

-- ============================================
-- SUMMARY
-- ============================================
SELECT
  'Tables' as check_type,
  COUNT(*) as count
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT
  'RLS Policies' as check_type,
  COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT
  'Indexes' as check_type,
  COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT
  'Triggers' as check_type,
  COUNT(*) as count
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public';
