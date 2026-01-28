# Local Testing Guide - Phase 2 Features

## ✅ Setup Complete

### Database Migrations Applied
- ✅ Activity chat triggers (auto-create conversations, manage participants)
- ✅ Push notifications table and triggers
- ✅ RLS policies fixed (no more infinite recursion)

### Edge Function Deployed
- ✅ `send-notification` function deployed to Supabase
- 📍 View in dashboard: https://supabase.com/dashboard/project/hcwolskmqcqkkrlefaog/functions

### iOS Simulator
- 🔄 Currently building... (Xcode is running)
- 📱 Will launch automatically when build completes

---

## 🧪 Testing Checklist

### 1. Test User Profiles

**Steps:**
1. Open the app in simulator
2. Navigate to the Feed tab
3. Tap on any activity card
4. Tap on the host name → should navigate to user profile
5. Verify you can see:
   - User avatar (or initials)
   - User name and location
   - Stats: Activities hosted, attended, crew count

**Expected:**
- ✅ Profile screen loads
- ✅ Dark mode works
- ✅ Stats display correctly

---

### 2. Test Crew System

**Prerequisites:** You'll need 2 test accounts. Create them using the Register screen.

**Account 1 (User A):**
1. Login as User A
2. Go to Feed → Find an activity hosted by User B
3. Tap on host name to view User B's profile
4. Tap "Add to Crew" button
5. Go to Crew tab → "Requests" (top right)
6. Verify request appears in "Requests Sent"

**Account 2 (User B):**
1. Login as User B (use a different simulator or switch accounts)
2. Go to Crew tab
3. Verify badge shows "1" pending request
4. Tap "Requests" → see User A's request
5. Tap "Accept"

**Back to Account 1 (User A):**
1. Go to Crew tab
2. Verify User B now appears in crew list
3. Badge should be gone

**Expected:**
- ✅ Can send crew requests
- ✅ Pending badge shows correct count
- ✅ Can accept/decline requests
- ✅ Crew members appear in list
- ✅ Can remove crew members

---

### 3. Test Direct Messaging

**Prerequisites:** User A and User B must be crew members (from test #2)

**Account 1 (User A):**
1. Go to User B's profile
2. Tap "Send Message" button
3. Type a message: "Hey, what's up?"
4. Tap Send
5. Message should appear immediately

**Account 2 (User B):**
1. Go to Chats tab
2. Verify badge shows "1" unread message
3. Tap on conversation with User A
4. See User A's message
5. Reply: "Not much, you?"
6. Tap Send

**Back to Account 1 (User A):**
1. Message should appear in real-time (no refresh needed)
2. Chat should update automatically

**Expected:**
- ✅ Can start conversation with crew member
- ✅ Messages appear in real-time
- ✅ Unread badge updates correctly
- ✅ GiftedChat UI displays properly
- ✅ Dark mode works in chat

---

### 4. Test Activity Group Chat

**Account 1 (User A):**
1. Create a new activity (or find an existing one)
2. Join the activity (if not already joined)
3. Go to activity detail screen
4. Verify "Open Group Chat" button appears
5. Tap the button
6. Send a message: "Who's excited for this?"

**Account 2 (User B):**
1. Join the same activity
2. Go to activity detail screen
3. Tap "Open Group Chat"
4. Verify you see User A's message
5. Reply: "I am!"

**Back to Account 1 (User A):**
1. Message should appear in real-time

**Test Leave Activity:**
1. As User B, leave the activity
2. Try to access group chat
3. Verify User B can no longer see the chat button

**Expected:**
- ✅ Group chat button appears for attendees only
- ✅ Messages appear in real-time
- ✅ Auto-added when joining activity
- ✅ Auto-removed when leaving activity
- ✅ Host can always access chat

---

### 5. Test Push Notifications (Simulator Limitation)

**⚠️ Important:** Push notifications DO NOT work in simulators!

For now, verify that:
1. Settings → Notification Settings appears
2. Toggle shows current permission status
3. No errors in console

**To actually test push notifications:**
- You'll need a physical iOS device
- See: `PUSH_NOTIFICATIONS_SETUP.md` for full setup
- Build with: `eas build --profile development --platform ios`

---

## 🔍 Debugging Tips

### Check Metro Bundler
```bash
# In project root, Metro should be running
# Look for: "Metro waiting on exp://192.168.x.x:8081"
```

### View Expo Logs
```bash
npx expo start
# Or check terminal where Expo is running
```

### Common Issues

**Issue: "Cannot read property 'id' of undefined"**
- Solution: Make sure you're logged in
- Try: Logout and login again

**Issue: Chat screen crashes**
- Solution: Make sure both users have accepted crew request
- Non-crew members cannot message each other

**Issue: Group chat button doesn't appear**
- Solution: Make sure you've joined the activity
- Only attendees and host can see the chat button

**Issue: Real-time messages not working**
- Solution: Check internet connection
- Restart Metro bundler: `npx expo start --clear`

**Issue: Unread badge doesn't update**
- Solution: Refresh the Chats tab (pull down)
- Check if you're logged in as the correct user

---

## 📊 Database Verification

### Check Tables
Run the test script:
```bash
node test-database-setup.js
```

Should show:
- ✅ push_tokens table exists
- ✅ conversations table exists
- ✅ messages table exists
- ✅ conversation_participants table exists
- ✅ crew_connections table exists

### Check Supabase Dashboard
Visit: https://supabase.com/dashboard/project/hcwolskmqcqkkrlefaog

**Table Editor:**
- Check `push_tokens` - should be empty for now
- Check `conversations` - should populate when you create chats
- Check `messages` - should populate when you send messages
- Check `crew_connections` - should populate when you send requests

**Edge Functions:**
- Check `send-notification` - should show as deployed

---

## 🎯 What Works in Simulator

✅ **Fully Functional:**
- User profiles
- Crew requests (send/accept/decline)
- Direct messaging (1:1 chat)
- Activity group chat
- Real-time message updates
- Unread badges
- Dark mode

⚠️ **Limited Functionality:**
- Push notifications (requires physical device)
- Notification permissions (will show as denied in simulator)

---

## 🚀 Next Steps

Once local testing is complete:

1. **Test on Physical Device**
   ```bash
   # Build development version
   eas build --profile development --platform ios

   # Install on device when build completes
   # Download from Expo dashboard
   ```

2. **Configure Push Credentials**
   ```bash
   eas credentials
   # Setup iOS push certificates
   ```

3. **Test Push Notifications**
   - Send message from one account
   - Verify notification appears on physical device
   - Tap notification → should open chat

4. **Production Build**
   ```bash
   eas build --profile production --platform ios
   ```

---

## 📝 Test Results Template

Copy this to track your testing:

```
## Phase 2 Testing Results

### User Profiles
- [ ] Navigate to profile from activity ____
- [ ] Stats display correctly ____
- [ ] Dark mode works ____

### Crew System
- [ ] Send crew request ____
- [ ] Badge shows pending count ____
- [ ] Accept request ____
- [ ] Decline request ____
- [ ] Remove crew member ____

### Direct Messaging
- [ ] Start conversation ____
- [ ] Send message ____
- [ ] Receive message in real-time ____
- [ ] Unread badge updates ____
- [ ] Dark mode works ____

### Activity Group Chat
- [ ] Join activity → auto-added to chat ____
- [ ] Send group message ____
- [ ] Receive group message ____
- [ ] Leave activity → removed from chat ____

### Push Notifications (Physical Device Only)
- [ ] Permission request appears ____
- [ ] Token registered ____
- [ ] Receive notification ____
- [ ] Tap notification opens screen ____

### Notes:
(Add any issues or observations here)
```

---

## ✅ Success Criteria

All features working = Phase 2 complete! 🎉

- Users can view profiles ✓
- Users can build their crew ✓
- Crew members can message ✓
- Activity chats work automatically ✓
- App is ready for push notification setup ✓
