# Phase 2 Testing Checklist

## 🎯 Testing Overview
This document provides a comprehensive manual testing checklist for all Phase 2 features implemented in CityCrew.

**Test Date:** _______________
**Tester:** _______________
**Device:** _______________
**iOS Version:** _______________

---

## 1. Navigation & Tab Bar

### ✅ Tab Bar Structure
- [ ] **Only 4 tabs visible**: Feed, Chats, Crew, Profile
- [ ] Feed tab shows orange icon and label
- [ ] Chats tab shows message icon
- [ ] Crew tab shows people icon
- [ ] Profile tab shows person icon
- [ ] Settings tab is hidden (not in tab bar)
- [ ] Style tab is hidden (not in tab bar)

### ✅ Tab Badges
- [ ] Chats tab shows unread count badge when messages unread
- [ ] Crew tab shows pending request count badge
- [ ] Badges disappear when counts reach 0
- [ ] Badge counts update in real-time

---

## 2. User Profiles

### ✅ View User Profile
- [ ] Tap on activity host name in activity card → navigates to user profile
- [ ] Tap on host section in activity detail → navigates to user profile
- [ ] Profile shows: avatar, name, bio, location
- [ ] Profile shows activity stats (hosted, attended)

### ✅ Profile Actions
- [ ] Own profile: No action buttons shown
- [ ] Non-crew user: "Add to Crew" button visible
- [ ] Pending sent request: "Request Sent" button (disabled, gray)
- [ ] Pending received request: "Request Pending" button (yellow)
- [ ] Crew member: Shows "✓ In Your Crew" and "Send Message" button

---

## 3. Crew System

### ✅ My Crew Page Layout
- [ ] Page title shows "My Crew"
- [ ] **Requests Received** section at top (if any)
- [ ] **Requests Sent** section below (if any)
- [ ] **My Crew** section at bottom
- [ ] Each section shows count in header
- [ ] Empty state shows when no crew or requests

### ✅ Send Crew Request
- [ ] Navigate to user profile (non-crew member)
- [ ] Tap "Add to Crew" button
- [ ] Button changes to "Request Sent"
- [ ] Request appears in "Requests Sent" section on My Crew page
- [ ] Crew tab badge increments (if request is received by you)

### ✅ Receive Crew Request
- [ ] Crew tab shows badge with count
- [ ] Open My Crew page
- [ ] Request shows in "Requests Received" section
- [ ] Shows: User avatar, name, and Accept/Decline buttons

### ✅ Accept Crew Request
- [ ] Tap "Accept" button on received request
- [ ] Request disappears from "Requests Received"
- [ ] User appears in "My Crew" section
- [ ] Badge count decrements
- [ ] Can now message the user

### ✅ Decline Crew Request
- [ ] Tap "Decline" button on received request
- [ ] Request disappears from "Requests Received"
- [ ] User does NOT appear in "My Crew"
- [ ] Badge count decrements

### ✅ Remove Crew Member
- [ ] Find crew member in "My Crew" section
- [ ] Tap "Remove" or swipe to delete (if implemented)
- [ ] Member removed from list
- [ ] Cannot message them anymore

---

## 4. Direct Messaging (DM)

### ✅ Conversations List
- [ ] Chats tab shows list of conversations
- [ ] Each conversation shows: avatar, name, last message, time
- [ ] Unread conversations show badge with count
- [ ] Conversations sorted by most recent
- [ ] Empty state shows "No conversations yet"

### ✅ Start Conversation
- [ ] Go to crew member profile
- [ ] Tap "Send Message" button
- [ ] Opens chat screen with conversation
- [ ] Can type and send messages

### ✅ Basic Messaging
- [ ] Type text message in input field
- [ ] Send button appears when text entered
- [ ] Tap send button → message appears in chat
- [ ] Message shows sender name and timestamp
- [ ] Own messages aligned right, other messages left

### ✅ Real-time Updates
- [ ] Send message from User A device
- [ ] Message appears on User B device within 2 seconds
- [ ] No refresh needed
- [ ] Works in both directions

### ✅ Message Status (Feature 16)
- [ ] New message shows "sending" state briefly
- [ ] Message transitions to "sent" after successful send
- [ ] Status indicator visible on messages

### ✅ Read Receipts
- [ ] Open conversation marks messages as read
- [ ] Unread count updates in conversation list
- [ ] Badge on Chats tab updates

---

## 5. Activity Group Chat

### ✅ Auto-creation
- [ ] Join an activity as attendee
- [ ] Group chat automatically created
- [ ] Host and all attendees added to chat

### ✅ Access Group Chat
- [ ] Open activity detail page (as attendee)
- [ ] "Chat" button visible
- [ ] Tap Chat button → opens group chat
- [ ] Shows all activity attendees

### ✅ Group Messaging
- [ ] Send message in group chat
- [ ] All attendees receive message
- [ ] Messages show sender names
- [ ] Works same as direct messages

### ✅ Join/Leave Behavior
- [ ] New attendee joins activity → auto-added to chat
- [ ] User leaves activity → removed from chat
- [ ] Can no longer see or send messages after leaving

---

## 6. GiftedChat Features

### ✅ Feature 8: Typing Indicator
- [ ] Start typing in conversation
- [ ] Other user sees "User is typing..." at bottom
- [ ] Indicator disappears after 3 seconds of no typing
- [ ] Indicator disappears immediately after sending message

### ✅ Feature 9: Send Images
- [ ] Tap blue "+" button in chat
- [ ] Select "Send Image"
- [ ] Permission request appears (first time)
- [ ] Grant permission
- [ ] Image picker opens
- [ ] Select photo
- [ ] Image uploads and appears in chat
- [ ] Other user receives image
- [ ] Can tap image to view full size

### ✅ Feature 10: Send Videos
- [ ] Tap blue "+" button
- [ ] Select "Send Video"
- [ ] Permission request (first time)
- [ ] Video picker opens
- [ ] Select video
- [ ] Video uploads (may take time for large files)
- [ ] Video appears in chat with thumbnail
- [ ] Other user receives video
- [ ] Can tap to play

### ✅ Feature 11: Send Audio
- [ ] Tap blue "+" button
- [ ] Select "Send File" (for audio files)
- [ ] Select audio file
- [ ] Audio uploads
- [ ] Shows with duration (if available)
- [ ] Other user can play audio

### ✅ Feature 12: Send Files
- [ ] Tap blue "+" button
- [ ] Select "Send File"
- [ ] Document picker opens
- [ ] Select any file (PDF, etc.)
- [ ] File uploads
- [ ] Shows file name and size
- [ ] Other user receives file

### ✅ Feature 14: Message Reactions (if UI implemented)
- [ ] Long-press on message
- [ ] Reaction picker appears
- [ ] Tap emoji (👍, ❤️, 😂, etc.)
- [ ] Reaction appears on message
- [ ] Other users see reaction
- [ ] Can tap reaction to add/remove

### ✅ Feature 16: Message Status
- [ ] Messages show status: sending → sent → delivered → read
- [ ] Visual indicator for each status
- [ ] Updates in real-time

### ✅ Feature 18: GIF Support (if implemented)
- [ ] Can send GIFs via image picker
- [ ] GIFs animate in chat
- [ ] Both users see animation

### ✅ Feature 20: System Messages
- [ ] System messages show in gray/centered
- [ ] No sender avatar
- [ ] Examples: "User joined", "User left"

### ✅ Feature 22: Scroll to Bottom Button
- [ ] Scroll up in chat to see old messages
- [ ] Blue chevron-down button appears
- [ ] Tap button → scrolls to bottom instantly
- [ ] Button disappears when at bottom

### ✅ Feature 23: Infinite Scroll
- [ ] Open conversation with many messages
- [ ] Scroll up to top
- [ ] Older messages load automatically
- [ ] No pagination buttons needed
- [ ] Smooth scrolling experience

---

## 7. Error Handling

### ✅ Network Errors
- [ ] Turn off WiFi/cellular
- [ ] Try sending message → shows error
- [ ] Message marked as "failed"
- [ ] Turn network back on → can retry

### ✅ Permission Denials
- [ ] Deny image picker permission
- [ ] Appropriate error message shown
- [ ] Provides instruction to enable in Settings

### ✅ Upload Failures
- [ ] Try uploading very large file
- [ ] Appropriate error shown
- [ ] Can retry or cancel

---

## 8. Dark Mode

### ✅ All Screens Support Dark Mode
- [ ] Enable dark mode in device settings
- [ ] My Crew page: Dark background, light text
- [ ] Chats list: Dark background
- [ ] Chat screen: Dark bubbles and input
- [ ] User profiles: Dark theme
- [ ] All badges, buttons, cards use dark colors
- [ ] Icons show proper contrast

---

## 9. Performance

### ✅ Smooth Operation
- [ ] Tab switching is instant
- [ ] Scrolling is smooth (60fps)
- [ ] Messages load quickly
- [ ] Image uploads don't freeze UI
- [ ] Real-time updates don't lag

### ✅ Memory Usage
- [ ] App doesn't crash after extended use
- [ ] Can scroll through many messages without lag
- [ ] Can switch between many conversations

---

## 10. Data Persistence

### ✅ State Preservation
- [ ] Close and reopen app
- [ ] Crew list persists
- [ ] Conversations persist
- [ ] Messages still visible
- [ ] Unread counts accurate

### ✅ Background Operation
- [ ] Minimize app
- [ ] Receive message (should trigger notification in Phase 2F)
- [ ] Open app → message visible
- [ ] Unread count correct

---

## 🐛 Bug Tracking

### Issues Found:

| # | Feature | Description | Severity | Status |
|---|---------|-------------|----------|--------|
| 1 |         |             |          |        |
| 2 |         |             |          |        |
| 3 |         |             |          |        |

---

## ✅ Sign-off

**All features tested:** [ ] Yes [ ] No
**Critical bugs found:** [ ] Yes [ ] No
**Ready for production:** [ ] Yes [ ] No

**Tester Signature:** _______________
**Date:** _______________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
