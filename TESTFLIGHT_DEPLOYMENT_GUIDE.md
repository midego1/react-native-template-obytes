# TestFlight Deployment Guide for CityCrew

Complete step-by-step guide to deploy CityCrew to TestFlight and App Store Connect.

---

## ✅ Pre-Deployment Verification

Before building, verify everything is configured correctly:

### 1. iOS Configuration ✅
- [x] Push notification entitlements set to `production`
- [x] Bundle ID: `app.citycrew` (for production)
- [x] Privacy descriptions in Info.plist

### 2. Android Configuration ✅
- [x] Release signing configured for EAS
- [x] Package name: `app.citycrew` (for production)
- [x] Namespace: `app.citycrew`

### 3. API Keys ✅
- [x] Supabase URL configured in `.env`
- [x] Supabase publishable key configured in `.env`
- [x] Google Places API key configured in `.env`
- All keys will be automatically included in production builds

### 4. Code Quality ✅
- [x] All console.log statements removed or wrapped with `__DEV__`
- [x] No debug code in production
- [x] Age verification checkbox added to registration

### 5. Legal Requirements
- [ ] **Privacy policy hosted** at `https://citycrew.app/privacy` (REQUIRED for App Store)
- [ ] **Terms of service hosted** at `https://citycrew.app/terms` (REQUIRED for App Store)
- [x] Settings screen links to privacy/terms (graceful error handling if not live yet)

---

## 🚀 Step-by-Step Deployment

### Step 1: Host Legal Documents (CRITICAL for App Store)

Before you can submit to App Store Connect, you MUST host your privacy policy and terms of service.

**Options for hosting:**

#### Option A: GitHub Pages (Free, Easy)
```bash
# Create a simple GitHub Pages site
# 1. Create a new repo called "citycrew-legal" or use existing website repo
# 2. Create index.html with links to privacy and terms
# 3. Create privacy.html with contents from PRIVACY_POLICY.md
# 4. Create terms.html with contents from TERMS_OF_SERVICE.md
# 5. Enable GitHub Pages in repo settings
# 6. Your URLs will be: https://yourusername.github.io/citycrew-legal/privacy.html
```

#### Option B: Netlify/Vercel (Free, Professional)
```bash
# 1. Create a simple static site
# 2. Add HTML files for privacy and terms
# 3. Deploy to Netlify or Vercel
# 4. Get custom domain (optional): citycrew.app
# 5. URLs: https://citycrew.app/privacy and https://citycrew.app/terms
```

#### Option C: Your Own Website
```bash
# If you have an existing website:
# 1. Create /privacy page with PRIVACY_POLICY.md content
# 2. Create /terms page with TERMS_OF_SERVICE.md content
# 3. Make sure they're accessible publicly
```

**After hosting, update Settings screen:**
```bash
# Edit src/features/settings/settings-screen.tsx
# Update lines 79 and 95 with your actual URLs:
const url = 'https://YOUR-ACTUAL-URL.com/privacy';
const url = 'https://YOUR-ACTUAL-URL.com/terms';
```

---

### Step 2: Install EAS CLI (if not already installed)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Verify login
eas whoami
```

---

### Step 3: Configure EAS Project (First Time Only)

```bash
# Initialize EAS (if not already done)
cd /Users/midego/city-crew-app-obytes/react-native-template-obytes
eas build:configure

# This will:
# - Create/update eas.json
# - Link project to your Expo account
# - Set up build profiles
```

---

### Step 4: Set Up Apple Developer Account

**Requirements:**
- Apple Developer Program membership ($99/year)
- Apple ID with 2-factor authentication
- Access to App Store Connect

**Create App in App Store Connect:**

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" > "+" > "New App"
3. Fill in details:
   - **Platform:** iOS
   - **Name:** CityCrew
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** Select `app.citycrew` (or create new identifier)
   - **SKU:** citycrew (or any unique identifier)
   - **User Access:** Full Access

4. In App Information:
   - **Category:** Social Networking (or Travel)
   - **Age Rating:** 17+ (due to user-generated content)
   - **Privacy Policy URL:** https://citycrew.app/privacy (MUST BE LIVE)
   - **Support URL:** Your support email or website

---

### Step 5: Build iOS App for Production

```bash
# Build for iOS with production profile
eas build --profile production --platform ios

# EAS will:
# 1. Ask if you want to create credentials (first time)
#    - Choose "Yes" to let EAS manage credentials automatically
# 2. Generate/use existing distribution certificate
# 3. Generate/use existing provisioning profile
# 4. Build the app with production configuration
# 5. Upload to EAS servers

# This takes 15-30 minutes typically
# You'll get a link to track build progress
```

**Build Output:**
- You'll receive a `.ipa` file URL when build completes
- This file is ready for TestFlight/App Store submission

---

### Step 6: Submit to TestFlight

```bash
# Submit the iOS build to TestFlight
eas submit --profile production --platform ios

# You'll be prompted for:
# 1. Apple ID (your App Store Connect account)
# 2. App-specific password (generate at appleid.apple.com)
#    - Go to https://appleid.apple.com/account/manage
#    - Security > App-Specific Passwords > Generate Password
#    - Save this password for EAS
# 3. Apple Team ID (found in App Store Connect)

# EAS will:
# - Upload the .ipa to App Store Connect
# - Process the build (10-20 minutes)
# - Make it available in TestFlight
```

**Alternative Method (Manual):**
```bash
# 1. Download the .ipa from EAS build page
# 2. Open Transporter app (Mac only)
# 3. Drag .ipa file to Transporter
# 4. Click "Deliver"
```

---

### Step 7: Configure TestFlight

After submission, configure TestFlight in App Store Connect:

1. **Go to App Store Connect > TestFlight**

2. **Set Up Test Information:**
   - Beta App Description: "Connect with fellow travelers and discover activities"
   - Feedback Email: your-email@example.com
   - What to Test: "Test all features including signup, chat, activities, and push notifications"

3. **Add Internal Testers (Optional):**
   - Click "Internal Testing" > "+" > Add testers
   - Internal testers = your team members with App Store Connect access
   - They can install immediately

4. **Add External Testers:**
   - Click "External Testing" > Create new group
   - Group name: "Beta Testers"
   - Add testers via email addresses
   - Click "Submit for Review" (required for external testing)

5. **Beta App Review (External Testing Only):**
   - Fill out review notes
   - Provide test account credentials if needed
   - Submit for review
   - Approval typically takes 24-48 hours

---

### Step 8: Test on TestFlight

**Install TestFlight:**
1. Testers receive email invitation
2. Download TestFlight app from App Store
3. Open invitation link
4. Install CityCrew beta

**Critical Tests:**
- [ ] User registration with age verification checkbox
- [ ] Login and authentication
- [ ] Profile creation and editing
- [ ] Activity creation and joining
- [ ] Chat messaging (text and media uploads)
- [ ] Push notifications (requires physical device)
- [ ] Location/place search with Google Places
- [ ] Privacy/Terms links in Settings open correctly
- [ ] No crashes or errors

**On Physical Device:**
- Push notifications ONLY work on real devices (not simulator)
- Test on iPhone 12 or newer recommended
- Test on iOS 14.0+ minimum

---

### Step 9: Build Android App for Production

```bash
# Build for Android with production profile
eas build --profile production --platform android

# EAS will:
# 1. Generate/use Android keystore (first time)
# 2. Build Android App Bundle (.aab)
# 3. Sign with production keystore
# 4. Upload to EAS servers

# This takes 15-30 minutes typically
```

---

### Step 10: Submit to Google Play Console (Optional)

```bash
# Submit Android build to Google Play
eas submit --profile production --platform android

# You'll need:
# 1. Google Play Developer account ($25 one-time)
# 2. App created in Google Play Console
# 3. Service account JSON key (for automated submission)

# Alternative: Manual upload
# 1. Download .aab from EAS build page
# 2. Go to Google Play Console
# 3. Create new app
# 4. Upload .aab to Internal Testing or Production
```

---

### Step 11: Prepare App Store Listing

While TestFlight is being tested, prepare your App Store listing:

#### Required Assets:

**App Icon:**
- 1024x1024 PNG (no alpha channel)
- Must match app icon in binary

**Screenshots (Required Sizes):**
- iPhone 6.7" (Pro Max): 1290x2796 or 1284x2778
- iPhone 6.5" (Plus): 1242x2688
- iPhone 5.5" (older): 1242x2208
- iPad Pro 12.9" (3rd gen): 2048x2732
- iPad Pro 12.9" (2nd gen): 2732x2048

**Tip:** Use https://www.appscreenshotmaker.com or take screenshots on real devices

#### App Information:

**Name:** CityCrew

**Subtitle:** Connect with travelers worldwide

**Description:**
```
Connect with fellow travelers and discover activities in your city.

KEY FEATURES:
• Find travelers in your current city
• Create and join local activities
• Group chat with activity attendees
• Direct messaging with crew members
• Discover travel-minded people worldwide

Perfect for solo travelers, digital nomads, and anyone looking to connect with like-minded adventurers. Make friends, find travel buddies, and never explore alone again.

Requirements: Users must be 17 years or older.
```

**Keywords:** travel, travelers, social, activities, meetup, friends, nomad, adventure

**Category:** Social Networking (Primary), Travel (Secondary)

**Age Rating:** 17+
- Select: Infrequent/Mild: Profanity or Crude Humor
- Select: Infrequent/Mild: Sexual Content or Nudity
- Reason: User-generated content (chats, profiles)

---

### Step 12: Submit for App Review

Once TestFlight testing is complete:

1. **Go to App Store Connect > App Store tab**

2. **Add Build:**
   - Click "+" next to Build
   - Select your TestFlight build
   - Click "Done"

3. **Complete All Required Fields:**
   - App Information
   - Pricing and Availability
   - Privacy Policy URL (MUST BE LIVE)
   - Support URL
   - Age Rating
   - App Review Information

4. **App Review Information:**
   - Contact Information
   - **Demo Account:** Provide test login credentials
     - Email: demo@citycrew.app (or create a test account)
     - Password: [test password]
   - Notes: "Demo account is pre-configured. Please test activities, chat, and crew features."

5. **Submit for Review:**
   - Click "Submit for Review"
   - Review typically takes 24-48 hours
   - You'll receive email updates on status

---

## 📋 Pre-Submission Checklist

### CRITICAL (App Store Will Reject Without These)
- [ ] Privacy policy hosted and accessible at URL provided
- [ ] Terms of service hosted and accessible
- [ ] App doesn't crash on launch
- [ ] All features work as described
- [ ] Demo account provided with credentials
- [ ] Age rating set to 17+
- [ ] Age verification checkbox works in registration
- [ ] Privacy policy URL in Settings opens correctly
- [ ] Push notifications work (if enabled)
- [ ] No placeholder content or "Lorem ipsum"

### RECOMMENDED
- [ ] App icon is polished and professional
- [ ] Screenshots show key features clearly
- [ ] Description is clear and accurate
- [ ] No broken links or missing content
- [ ] Tested on multiple iOS versions
- [ ] Tested on different device sizes
- [ ] Performance is smooth (no lag)

---

## 🚨 Common Rejection Reasons & How to Avoid

### 1. Missing Privacy Policy
**Reason:** Privacy policy URL not accessible
**Fix:** Host privacy policy and verify URL works before submission

### 2. Metadata Rejection
**Reason:** Screenshots don't match app or misleading description
**Fix:** Use actual app screenshots, accurate description

### 3. Crashes
**Reason:** App crashes during review
**Fix:** Test thoroughly on TestFlight first, fix all crashes

### 4. Broken Features
**Reason:** Key features don't work (login, core functionality)
**Fix:** Provide working demo account, ensure API keys are configured

### 5. Age Rating Incorrect
**Reason:** Content doesn't match age rating
**Fix:** Set to 17+ for user-generated content apps

### 6. Guideline 4.3 - Spam
**Reason:** App is too similar to other apps
**Fix:** Ensure unique value proposition, differentiate from competitors

### 7. In-App Purchase Issues
**Reason:** Payment flows not using Apple's IAP (if applicable)
**Fix:** Not applicable for CityCrew (no paid features currently)

---

## ⏱️ Timeline Expectations

**Full Process (First Time):**
- Build time: 30-60 minutes (iOS + Android)
- TestFlight processing: 10-20 minutes
- Beta App Review (external testers): 24-48 hours
- TestFlight testing: 3-7 days recommended
- App Store review: 24-48 hours typically
- **Total: 5-10 days from first build to App Store approval**

**Subsequent Updates:**
- Build time: 30-60 minutes
- TestFlight processing: 10-20 minutes
- App Store review: 24-48 hours
- **Total: 1-3 days per update**

---

## 🔄 Update Process (After Initial Release)

When you need to release an update:

1. **Make code changes**
2. **Test locally**
3. **Build new version:**
   ```bash
   eas build --profile production --platform ios --auto-submit
   ```
4. **Wait for build & upload**
5. **Add build to App Store listing**
6. **Submit for review**

**Version Numbering:**
- Major updates: 2.0.0 (breaking changes)
- Minor updates: 1.1.0 (new features)
- Patches: 1.0.1 (bug fixes)

---

## 📞 Support & Resources

**EAS Build Documentation:**
https://docs.expo.dev/build/introduction/

**App Store Review Guidelines:**
https://developer.apple.com/app-store/review/guidelines/

**TestFlight Documentation:**
https://developer.apple.com/testflight/

**Common Issues:**
- Build fails: Check eas.json configuration
- Credentials issues: Run `eas credentials` to manage
- Submission fails: Verify Apple ID and app-specific password

**Get Help:**
- Expo Forums: https://forums.expo.dev/
- Expo Discord: https://chat.expo.dev/

---

## ✅ Final Verification Before Submission

Run through this checklist one final time:

### Configuration
- [ ] iOS entitlements = production
- [ ] Android signing = release keystore
- [ ] Bundle ID = app.citycrew
- [ ] Package name = app.citycrew
- [ ] API keys configured and working
- [ ] No console.log in production

### Legal
- [ ] Privacy policy hosted and accessible
- [ ] Terms of service hosted and accessible
- [ ] Settings links work correctly
- [ ] Age verification checkbox present

### Testing
- [ ] Tested on TestFlight
- [ ] All features work
- [ ] No crashes
- [ ] Push notifications work
- [ ] Demo account created

### App Store Connect
- [ ] App created in App Store Connect
- [ ] Screenshots uploaded
- [ ] Description written
- [ ] Privacy policy URL added
- [ ] Age rating set to 17+
- [ ] Demo credentials provided

---

## 🎉 You're Ready!

If all checkboxes above are checked, you're 100% ready to submit to the App Store!

**Final command to build and submit:**
```bash
# Build and submit iOS to TestFlight in one command
eas build --profile production --platform ios --auto-submit

# After TestFlight testing, submit to App Store via App Store Connect web interface
```

**Good luck with your App Store submission! 🚀**
