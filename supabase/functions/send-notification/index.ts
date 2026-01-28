import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

type NotificationPayload = {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: string;
};

serve(async (req) => {
  try {
    const payload: NotificationPayload = await req.json();
    const { userId, title, body, data, channelId } = payload;

    // Get user's push tokens from database
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch push tokens: ${error.message}`);
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No push tokens found for user' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Build Expo push messages
    const messages = tokens.map(tokenRecord => ({
      to: tokenRecord.token,
      sound: 'default',
      title,
      body,
      data: data || {},
      channelId: channelId || 'default',
      priority: 'high',
    }));

    // Send to Expo Push API
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
