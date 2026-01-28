-- ============================================
-- SEED SAMPLE ACTIVITIES FOR TESTING
-- Run this in Supabase SQL Editor
-- ============================================

-- First, get the test user ID
DO $$
DECLARE
  test_user_id uuid;
  activity_id1 uuid;
  activity_id2 uuid;
  activity_id3 uuid;
  activity_id4 uuid;
BEGIN
  -- Get the test user
  SELECT id INTO test_user_id
  FROM users
  WHERE email = 'test@citycrew.com'
  LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'Test user not found. Please create a user with email test@citycrew.com first.';
  END IF;

  -- Insert sample activities

  -- Activity 1: Coffee & Coworking (Happening Soon)
  INSERT INTO activities (
    host_id,
    title,
    description,
    category,
    location_name,
    location_address,
    city,
    country,
    starts_at,
    ends_at,
    max_attendees,
    is_public,
    requires_approval,
    status
  ) VALUES (
    test_user_id,
    'Coffee & Coworking at Starbucks Reserve',
    'Let''s grab some coffee and get some work done together! I''ll be working on my laptop. Feel free to join if you''re looking for a productive morning.',
    'coffee',
    'Starbucks Reserve Roastery',
    '1124 Pike St, Seattle, WA',
    'Seattle',
    'United States',
    now() + INTERVAL '2 hours',
    now() + INTERVAL '4 hours',
    5,
    true,
    false,
    'active'
  ) RETURNING id INTO activity_id1;

  -- Activity 2: Sunset Hike (Today Evening)
  INSERT INTO activities (
    host_id,
    title,
    description,
    category,
    location_name,
    city,
    country,
    starts_at,
    max_attendees,
    is_public,
    status
  ) VALUES (
    test_user_id,
    'Sunset Hike at Discovery Park',
    'Join me for a beautiful sunset hike! We''ll meet at the north parking lot and hike to the beach. Perfect for travelers who love nature!',
    'adventure',
    'Discovery Park',
    'Seattle',
    'United States',
    now() + INTERVAL '6 hours',
    8,
    true,
    'active'
  ) RETURNING id INTO activity_id2;

  -- Activity 3: Drinks & Networking (Tomorrow)
  INSERT INTO activities (
    host_id,
    title,
    description,
    category,
    location_name,
    location_address,
    city,
    country,
    starts_at,
    is_flexible_time,
    is_public,
    status
  ) VALUES (
    test_user_id,
    'Happy Hour for Digital Nomads',
    'Digital nomads and remote workers, let''s meet up for drinks and networking! Share travel stories and make new friends.',
    'drinks',
    'The Tap House',
    '1506 6th Ave, Seattle, WA',
    'Seattle',
    'United States',
    now() + INTERVAL '1 day' + INTERVAL '5 hours',
    false,
    true,
    'active'
  ) RETURNING id INTO activity_id3;

  -- Activity 4: Food Tour (Weekend)
  INSERT INTO activities (
    host_id,
    title,
    description,
    category,
    location_name,
    city,
    country,
    starts_at,
    max_attendees,
    is_public,
    status
  ) VALUES (
    test_user_id,
    'Pike Place Market Food Tour',
    'Let''s explore Pike Place Market together! We''ll try different foods, see the famous fish throwing, and maybe grab some local coffee.',
    'food',
    'Pike Place Market',
    'Seattle',
    'United States',
    now() + INTERVAL '3 days',
    6,
    true,
    'active'
  ) RETURNING id INTO activity_id4;

  RAISE NOTICE 'Successfully created 4 sample activities!';
  RAISE NOTICE 'Activity IDs: %, %, %, %', activity_id1, activity_id2, activity_id3, activity_id4;
END $$;

-- Verify activities were created
SELECT
  id,
  title,
  category,
  starts_at,
  city,
  status
FROM activities
ORDER BY starts_at ASC;
