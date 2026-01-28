-- Reset activities and add 4 new sample activities to test triggers
-- Get the first user ID to use as host for new activities
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Get first user
  SELECT id INTO first_user_id FROM users ORDER BY created_at LIMIT 1;

  -- Delete all existing activities (CASCADE will delete conversations, attendees, etc.)
  DELETE FROM activities;

  -- Insert 4 new activities with variety
  INSERT INTO activities (
    title,
    description,
    category,
    location_name,
    city,
    country,
    starts_at,
    max_attendees,
    host_id,
    status
  ) VALUES
  (
    'Morning Coffee & Code',
    'Join us for coffee and casual coding. Bring your laptop and current project. Great for networking with other developers!',
    'social',
    'Blue Bottle Coffee, Ferry Building',
    'San Francisco',
    'United States',
    (CURRENT_DATE + INTERVAL '2 days')::date + TIME '09:00',
    8,
    first_user_id,
    'active'
  ),
  (
    'Golden Gate Bridge Run',
    'Early morning 5K run across the Golden Gate Bridge. All fitness levels welcome. Meet at the parking lot.',
    'sports',
    'Golden Gate Bridge Welcome Center',
    'San Francisco',
    'United States',
    (CURRENT_DATE + INTERVAL '3 days')::date + TIME '07:00',
    12,
    first_user_id,
    'active'
  ),
  (
    'Mission District Food Tour',
    'Explore the best tacos, burritos, and street food in the Mission. We''ll hit 5-6 spots over 2 hours.',
    'food',
    'Mission District, 16th St BART',
    'San Francisco',
    'United States',
    (CURRENT_DATE + INTERVAL '5 days')::date + TIME '18:30',
    10,
    first_user_id,
    'active'
  ),
  (
    'Dolores Park Picnic & Games',
    'Afternoon hangout at Dolores Park. Bring snacks to share, we''ll have frisbees, cards, and good vibes.',
    'outdoor',
    'Dolores Park, SF',
    'San Francisco',
    'United States',
    (CURRENT_DATE + INTERVAL '7 days')::date + TIME '14:00',
    15,
    first_user_id,
    'active'
  );
END $$;
