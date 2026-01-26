-- Test User Creation Script
-- Run this in Supabase SQL Editor to create a test user
--
-- This creates:
-- 1. Auth user (for login)
-- 2. User profile (auto-created via trigger)

-- Create test auth user with signup function
-- Email: test@citycrew.com
-- Password: test123456

DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Insert into auth.users table
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'test@citycrew.com',
    crypt('test123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Test User"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO user_id;

  RAISE NOTICE 'Test user created with ID: %', user_id;
END $$;

-- Verify user was created
SELECT
  u.id,
  u.email,
  u.full_name,
  u.created_at
FROM users u
WHERE u.email = 'test@citycrew.com';
