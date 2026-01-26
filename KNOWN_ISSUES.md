# Known Issues - Phase 1

This document tracks minor issues discovered during Phase 1 testing.

## 1. Date/Time Input UX - Create Activity Form

**File:** `src/app/create-activity.tsx:277-288`

**Issue:** The create activity form requires users to manually type dates in ISO format (e.g., "2026-01-27T14:00"). This is not user-friendly and error-prone.

**Current Behavior:**
- Users must type the exact format: `YYYY-MM-DDTHH:MM`
- Easy to make typos or format mistakes
- No visual calendar picker

**Expected Behavior:**
- Should use a proper date/time picker component
- Visual calendar interface for selecting dates
- Separate time picker for selecting times
- Better validation and user feedback

**Impact:** Medium - Users can still create activities but the experience is suboptimal

**Suggested Fix:** Implement a proper DateTimePicker component using a library like `@react-native-community/datetimepicker` or `react-native-ui-datepicker`

---

## 2. Profile Activity Stats Always Show 0

**File:** `src/features/profile/profile-screen.tsx:106-124`

**Issue:** The profile screen shows hardcoded "0" values for activity statistics (Hosted, Attended, Connections).

**Current Behavior:**
```tsx
<Text className="mb-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
  0
</Text>;
```

**Expected Behavior:**
- Should fetch and display actual counts from the database
- Hosted: Count of activities where user is the host
- Attended: Count of activities user has attended (status='joined')
- Connections: Count of crew connections for the user

**Impact:** Low - Profile displays correctly but stats are not accurate

**Suggested Fix:**
- Create API hooks to fetch these statistics
- Query activities table for hosted count
- Query activity_attendees table for attended count
- Query crew_connections table for connections count

---

## 3. Potential Attendee Count Calculation Bug

**File:** `src/api/activities/use-activities.ts:64-68`

**Issue:** The attendee count calculation may not work correctly with the current Supabase query structure.

**Current Code:**
```typescript
const activities: Activity[] = (data || []).map(activity => ({
  ...activity,
  attendee_count: activity.attendees?.[0]?.count || 0,
  is_happening_now: isHappeningNow(activity.starts_at),
}));
```

**Problem:**
- The query uses `.select('attendees:activity_attendees (count)')` which doesn't return data in the expected format
- `activity.attendees?.[0]?.count` assumes a specific structure that Supabase may not provide
- Different from the working implementation in `use-activity.ts:56` which filters the attendees array

**Impact:** Low-Medium - Attendee counts may not display correctly in the activity feed

**Suggested Fix:**
- Use the same approach as `use-activity.ts`: fetch all attendees and count them
- Or use Supabase's `.count()` method separately
- Test with actual data to verify the issue exists

**Note:** This needs verification with actual test data to confirm if it's a real bug or if the Supabase query structure supports this pattern.

---

## Testing Notes

- TypeScript compilation: ✅ No errors
- Lint: ⚠️ Some style/formatting warnings (not functional issues)
- All Phase 1 features are functional
- Dark mode working correctly across all screens
- Navigation working as expected
