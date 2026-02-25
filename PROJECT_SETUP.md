# 🚀 Complete Setup Guide - SG Fitness Evolution

## Step-by-Step Installation (Hindi + English)

### चरण 1: Node.js Install करें

1. https://nodejs.org/ पर जाएं
2. LTS version download करें (FREE)
3. Install करें (Next, Next, Finish)
4. Verify करें:
```bash
node --version
npm --version
```

### चरण 2: Expo CLI Install करें

```bash
npm install -g expo-cli
```

### चरण 3: Firebase Account बनाएं (100% FREE)

1. https://console.firebase.google.com/ पर जाएं
2. "Add project" क्लिक करें
3. Project name: "SG-Fitness-Evolution"
4. Google Analytics: Enable (optional)
5. Create project

### चरण 4: Firebase Services Enable करें

**Authentication:**
1. Firebase Console → Authentication
2. "Get Started" क्लिक करें
3. Sign-in method → Email/Password → Enable
4. Save

**Firestore Database:**
1. Firebase Console → Firestore Database
2. "Create database"
3. Start in **test mode** (FREE)
4. Location: asia-south1 (Mumbai) - भारत के लिए best
5. Enable

**Storage:**
1. Firebase Console → Storage
2. "Get Started"
3. Start in test mode
4. Done

### चरण 5: Firebase Configuration निकालें

1. Firebase Console → Project Settings (⚙️ icon)
2. Scroll down → "Your apps"
3. Click Android icon (</>) 
4. Register app:
   - Android package name: `com.sgfitness.evolution`
   - App nickname: SG Fitness Evolution
   - Register app
5. **Download google-services.json** - यह file बाद में use होगी
6. Config को copy करके safe रखें

### चरण 6: Project Setup करें

```bash
# Project folder में जाएं
cd "d:\Android gym"

# Mobile app folder में dependencies install करें
cd mobile-app
npm install

# Expo के साथ start करें
npx expo start
```

### चरण 7: App चलाएं

**Option 1: Android Emulator**
1. Android Studio install करें (FREE)
2. AVD Manager से emulator setup करें
3. Terminal में 'a' press करें

**Option 2: Physical Phone (सबसे आसान!)**
1. Play Store से "Expo Go" app install करें (FREE)
2. Terminal में QR code scan करें
3. App automatically phone में open होगा

### चरण 8: Firebase Config अपनी App में डालें

`mobile-app/firebase-config.js` file में अपनी Firebase details add करें (Step 5 से):

```javascript
const firebaseConfig = {
  apiKey: "AIza...", // अपनी key यहाँ
  authDomain: "sg-fitness-evolution.firebaseapp.com",
  projectId: "sg-fitness-evolution",
  storageBucket: "sg-fitness-evolution.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:android:abc..."
};
```

## 🎯 Development Workflow

### App को Test करना:
```bash
cd mobile-app
npx expo start
```

### Changes करने के बाद:
- File save करें
- App automatically reload होगा (Fast Refresh)

### Production APK बनाना:
```bash
# EAS Build setup (FREE)
npm install -g eas-cli
eas login
eas build:configure

# Android APK build करें
eas build --platform android --profile preview
```

## 💡 Free Resources की Limits

### Firebase Free Tier (काफी है small-medium gym के लिए):
- **Firestore**: 50,000 reads/day, 20,000 writes/day
- **Storage**: 5GB space, 1GB/day download
- **Authentication**: Unlimited users
- **Hosting**: 10GB storage, 360MB/day transfer

आपकी gym में अगर 100-200 members हैं, तो यह **bilkul FREE** चलेगा!

## 🔧 Common Issues & Solutions

### Issue 1: `npm install` fail हो रहा है
```bash
# Cache clean करें
npm cache clean --force
npm install
```

### Issue 2: Expo start नहीं हो रहा
```bash
# Port change करें
npx expo start --port 8081
```

### Issue 3: Firebase connection error
- Firebase config check करें
- Internet connection verify करें
- Firebase console में services enable हैं verify करें

## 📱 App Testing Checklist

- [ ] User registration working
- [ ] Login working
- [ ] Profile creation
- [ ] Membership plan selection
- [ ] Workout plan view
- [ ] Attendance marking
- [ ] Progress tracking
- [ ] Push notifications

## 🎨 Customization Tips

### Colors change करना:
`mobile-app/theme/colors.js` में colors edit करें

### Logo add करना:
`mobile-app/assets/logo.png` में अपना logo रखें

### App name change करना:
`mobile-app/app.json` में `name` और `displayName` edit करें

## 🚀 Next Steps

1. ✅ Basic setup complete करें
2. ✅ Firebase configure करें
3. ✅ App test करें phone पर
4. ✅ Features customize करें
5. ✅ Production APK build करें
6. ✅ Play Store पर publish करें

## 📞 Need Help?

अगर कोई problem आए तो मुझे बताएं! मैं step-by-step help करूंगा.

---

**हैप्पी कोडिंग! 🎉**
