-- ============================================
-- MANUALLY CREATE USER PROFILE
-- Run this ONLY if the trigger didn't auto-create the profile
-- ============================================

-- First, get the user ID from auth.users
-- Replace 'test@citycrew.com' with your test email if different

DO $$
DECLARE
  auth_user_id uuid;
BEGIN
  -- Get the auth user ID
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = 'test@citycrew.com';

  IF auth_user_id IS NULL THEN
    RAISE EXCEPTION 'Auth user not found with email: test@citycrew.com';
  END IF;

  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM users WHERE id = auth_user_id) THEN
    RAISE NOTICE 'User profile already exists for: %', auth_user_id;
  ELSE
    -- Create the profile
    INSERT INTO users (id, email, full_name)
    VALUES (
      auth_user_id,
      'test@citycrew.com',
      'Test User'
    );
    RAISE NOTICE 'User profile created successfully for: %', auth_user_id;
  END IF;
END $$;

-- Verify the profile was created
SELECT
  id,
  email,
  full_name,
  created_at
FROM users
WHERE email = 'test@citycrew.com';
