# Push Notifications Setup Guide

This guide covers the setup required to enable push notifications in the CityCrew app.

## Overview

Push notifications have been implemented for:
- **New Messages**: Direct and group chat messages
- **Crew Requests**: When someone sends you a crew request
- **Crew Request Accepted**: When someone accepts your crew request

## Implementation Status

✅ **Completed:**
- Installed `expo-notifications` and `expo-device` packages
- Created notification permission handling and token registration
- Built notification settings UI in Settings screen
- Integrated notification initialization in app root
- Created Supabase Edge Function for sending push notifications
- Added database triggers for automatic notifications
- Configured app.config.ts with notification settings

## Setup Requirements

### 1. EAS Account & Project

The project is already configured with:
- **EAS Project ID**: `c3e1075b-6fe7-4686-aa49-35b46a229044`
- **Account Owner**: `obytes`

Verify configuration:
```bash
eas whoami
eas project:info
```

### 2. Push Notification Credentials

#### For iOS (Apple Push Notification Service):
```bash
eas credentials
```

Select:
1. iOS → Production
2. Push Notifications
3. Let EAS handle credentials (recommended)

**Requirements:**
- Apple Developer Account ($99/year)
- Enrolled in Apple Developer Program

#### For Android (Firebase Cloud Messaging):
```bash
eas credentials
```

Select:
1. Android → Production
2. Push Notifications
3. Let EAS handle credentials (recommended)

**Requirements:**
- Google Cloud Project (free)
- Firebase project created and linked

### 3. Deploy Supabase Edge Function

The edge function `send-notification` needs to be deployed to Supabase:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy send-notification

# Set required environment variables (already configured in Supabase)
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected
```

### 4. Run Database Migrations

Apply the push notification migrations:

```bash
# Run migrations locally
supabase db push

# Or apply to remote database
supabase db push --remote
```

This creates:
- `push_tokens` table for storing device tokens
- Database triggers for automatic notifications
- Helper function `send_push_notification()`

### 5. Build the App

Push notifications only work on physical devices, not simulators.

**Development Build:**
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

**Production Build:**
```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

### 6. Test Notifications

**On Physical Device:**
1. Install the app from the build
2. Create an account or login
3. Go to Settings → Enable Push Notifications
4. Grant permissions when prompted
5. Have another user send you a message or crew request
6. Verify notification appears

**Test Notification Flow:**
```
User A sends message → Database trigger fires → send_push_notification() called
→ Edge function fetches User B's tokens → Sends to Expo Push API → User B receives notification
```

## Code Structure

### Frontend Files
- `src/lib/notifications.ts` - Core notification setup and helpers
- `src/hooks/use-push-notifications.ts` - React hook for notifications
- `src/api/notifications/use-register-push-token.ts` - API hook for token registration
- `src/components/notifications/notification-settings.tsx` - Settings UI
- `src/components/notifications/permission-request.tsx` - Permission dialog
- `src/components/notifications/notification-initializer.tsx` - App initialization

### Backend Files
- `supabase/functions/send-notification/index.ts` - Edge function for sending push
- `supabase/migrations/20260128000000_push_notifications.sql` - Database schema and triggers

## Notification Data Structure

### Message Notification
```typescript
{
  type: 'message',
  conversationId: 'uuid',
  messageId: 'uuid'
}
```

### Crew Request Notification
```typescript
{
  type: 'crew_request',
  userId: 'uuid',
  requestId: 'uuid'
}
```

### Activity Notification (future)
```typescript
{
  type: 'activity',
  activityId: 'uuid'
}
```

## Troubleshooting

### Notifications Not Received

1. **Check permissions**: Settings → Notifications → Ensure enabled
2. **Check device**: Push only works on physical devices
3. **Check tokens**: Query `push_tokens` table to verify token registered
4. **Check logs**: Look for errors in edge function logs
5. **Check Expo Push API**: Use Expo Push Notification Tool to test token

### Permission Denied

- iOS: Settings → CityCrew → Notifications → Enable
- Android: Settings → Apps → CityCrew → Notifications → Enable

### Edge Function Errors

Check Supabase dashboard → Edge Functions → send-notification → Logs

Common issues:
- Missing environment variables
- Invalid push token format
- Rate limiting from Expo Push API

## Production Checklist

Before going to production:

- [ ] EAS credentials configured for iOS
- [ ] EAS credentials configured for Android
- [ ] Edge function deployed to Supabase production
- [ ] Database migrations applied to production
- [ ] Tested on physical iOS device
- [ ] Tested on physical Android device
- [ ] Notification icons created (iOS: notification-icon.png)
- [ ] Verified notification routing works (tapping opens correct screen)
- [ ] Tested with app in foreground
- [ ] Tested with app in background
- [ ] Tested with app killed
- [ ] Badge counts update correctly

## Further Reading

- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [EAS Build](https://docs.expo.dev/build/introduction/)
