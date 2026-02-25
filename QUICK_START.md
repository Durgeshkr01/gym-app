# 🚀 Quick Start Guide - SG Fitness Evolution

## Complete Installation (Step-by-Step)

### Prerequisites ✅

Download and install these (all FREE):

1. **Node.js**: https://nodejs.org/ (LTS version)
2. **Git**: https://git-scm.com/
3. **VS Code** (optional): https://code.visualstudio.com/
4. **Android Studio** (for emulator - optional): https://developer.android.com/studio

---

## 📱 Mobile App Setup

### Step 1: Install Dependencies

```powershell
# Open PowerShell and navigate to project
cd "d:\Android gym\mobile-app"

# Install Expo CLI globally
npm install -g expo-cli

# Install project dependencies
npm install

# If you get errors, try:
npm cache clean --force
npm install
```

### Step 2: Configure Firebase

1. Create Firebase project: https://console.firebase.google.com/
2. Enable Authentication, Firestore, Storage
3. Get your config from Project Settings
4. Update `mobile-app/firebase-config.js` with your credentials

### Step 3: Run the App

```powershell
# Start Expo development server
npx expo start

# Options will appear:
# Press 'a' - Run on Android emulator
# Press 'i' - Run on iOS simulator (Mac only)
# Press 'w' - Run in web browser
# Scan QR code with Expo Go app on your phone (easiest!)
```

### Install Expo Go on Phone:
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent
- iOS: https://apps.apple.com/app/expo-go/id982107779

---

## 🖥️ Backend Setup (Optional)

### Step 1: Install Dependencies

```powershell
cd "d:\Android gym\backend"
npm install
```

### Step 2: Configure Environment

```powershell
# Copy example environment file
copy .env.example .env

# Edit .env file with your settings
notepad .env
```

### Step 3: Setup Firebase Admin

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Save as `backend/serviceAccountKey.json`

### Step 4: Run Backend Server

```powershell
# Start server
npm start

# Or for development (auto-restart):
npm run dev
```

Server will run on: http://localhost:3000

---

## 🔥 Firebase Setup

Follow detailed guide in `FIREBASE_SETUP.md`

Quick checklist:
- [ ] Create Firebase project
- [ ] Enable Email/Password authentication
- [ ] Create Firestore database (test mode)
- [ ] Enable Storage
- [ ] Copy configuration to app
- [ ] Setup security rules

---

## 📦 Building APK for Android

### Option 1: Using EAS Build (Recommended - FREE)

```powershell
cd mobile-app

# Install EAS CLI
npm install -g eas-cli

# Login to Expo account (create free account)
eas login

# Configure EAS
eas build:configure

# Build APK (takes 10-20 minutes)
eas build --platform android --profile preview

# Download APK from link provided
```

### Option 2: Local Build

```powershell
# Install dependencies
npm install -g turtle-cli

# Build APK locally
turtle build:android --type apk --mode release
```

---

## 🎨 Customization

### Change App Name:
Edit `mobile-app/app.json`:
```json
{
  "expo": {
    "name": "Your Gym Name",
    "slug": "your-gym-slug"
  }
}
```

### Change Colors:
Edit `mobile-app/src/theme/theme.js`

### Add Logo:
Replace `mobile-app/assets/icon.png` with your logo (1024x1024 px)

---

## 📊 Database Management

### View Data:
Firebase Console → Firestore Database → Data tab

### Backup Data:
```powershell
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Export data
firebase firestore:export backups/
```

---

## 🐛 Common Issues & Solutions

### Issue 1: NPM Install Fails
```powershell
npm cache clean --force
npm install
```

### Issue 2: Expo Start Fails
```powershell
# Clear Expo cache
npx expo start -c

# Or reset everything
rm -rf node_modules
npm install
npx expo start
```

### Issue 3: Firebase Connection Error
- Check internet connection
- Verify `firebaseConfig` in `firebase-config.js`
- Check if services are enabled in Firebase Console

### Issue 4: Android Emulator Not Starting
- Enable Virtualization in BIOS
- Install Android Studio
- Create AVD in AVD Manager

---

## 🚀 Deployment Checklist

### Before Publishing:

- [ ] Test all features thoroughly
- [ ] Replace Firebase test mode with production rules
- [ ] Add app icon and splash screen
- [ ] Update app version in `app.json`
- [ ] Test on real devices
- [ ] Create privacy policy
- [ ] Build release APK
- [ ] Test APK on multiple devices

### Publishing to Play Store:

1. Create Google Play Console account ($25 one-time fee)
2. Create new app listing
3. Upload APK/AAB
4. Fill all required fields:
   - App description
   - Screenshots (2-8 images)
   - App icon
   - Feature graphic
   - Privacy policy URL
5. Complete content rating questionnaire
6. Set pricing (Free)
7. Submit for review

**Review takes 1-3 days**

---

## 💡 Pro Tips

1. **Use Expo Go app** initially - fastest way to test
2. **Enable Hot Reload** - changes reflect instantly
3. **Use Firebase Console** to manage data
4. **Start with test users** before going live
5. **Monitor Firebase usage** to stay in free tier
6. **Take regular backups** of Firestore data

---

## 📞 Need Help?

### Resources:
- Expo Documentation: https://docs.expo.dev/
- Firebase Documentation: https://firebase.google.com/docs
- React Native Paper: https://callstack.github.io/react-native-paper/
- Stack Overflow: https://stackoverflow.com/

### Check These Files:
- `README.md` - Project overview
- `PROJECT_SETUP.md` - Detailed setup (Hindi + English)
- `FIREBASE_SETUP.md` - Complete Firebase guide

---

## ⚡ Quick Commands Reference

```powershell
# Mobile App
cd mobile-app
npm install              # Install dependencies
npx expo start          # Start development server
npx expo start -c       # Start with cleared cache
eas build --platform android  # Build APK

# Backend
cd backend
npm install              # Install dependencies
npm start               # Start server
npm run dev             # Start with auto-reload

# Firebase
firebase login           # Login to Firebase CLI
firebase init           # Initialize Firebase
firebase deploy         # Deploy functions/hosting
```

---

## 🎉 Next Steps

1. ✅ Complete Firebase setup
2. ✅ Run app with `npx expo start`
3. ✅ Test on your phone using Expo Go
4. ✅ Customize branding (colors, logo, name)
5. ✅ Add sample data in Firebase
6. ✅ Test all features
7. ✅ Build APK
8. ✅ Publish to Play Store

---

**सब कुछ setup complete करने के बाद, aap का professional gym app ready होगा! 🏋️‍♂️💪**
