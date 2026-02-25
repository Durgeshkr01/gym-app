# SG Fitness Evolution - Complete Gym App

A professional, smooth, and feature-rich gym management app built with React Native and Firebase.

## 🌟 Features

### For Members:
- ✅ User Registration & Login
- ✅ Membership Plans & Payment Tracking
- ✅ Workout Plans & Exercise Library
- ✅ Progress Tracking (Weight, Body Measurements)
- ✅ Attendance History
- ✅ Trainer Assignment
- ✅ Diet Plans
- ✅ Push Notifications
- ✅ BMI Calculator

### For Admins/Trainers:
- ✅ Member Management
- ✅ Attendance Tracking
- ✅ Payment Management
- ✅ Workout Plan Creation
- ✅ Analytics Dashboard

## 🛠️ Technology Stack

### Frontend (Mobile App)
- **React Native** - Cross-platform mobile development
- **React Navigation** - Screen navigation
- **Redux Toolkit** - State management
- **React Native Paper** - UI components

### Backend & Database
- **Firebase Authentication** - User management (FREE)
- **Firebase Firestore** - Database (FREE tier - 50K reads/day)
- **Firebase Storage** - Image storage (FREE tier - 5GB)
- **Firebase Cloud Functions** - Serverless backend (FREE tier)
- **Firebase Cloud Messaging** - Push notifications (FREE)

### Additional Services
- **Expo** - Easy React Native development
- **Firebase Hosting** - Web admin panel (FREE)

## 📱 Installation Guide

### Prerequisites
1. Install Node.js (FREE): https://nodejs.org/
2. Install Git (FREE): https://git-scm.com/

### Step 1: Setup React Native with Expo

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Navigate to project directory
cd "d:\Android gym"

# Install mobile app dependencies
cd mobile-app
npm install
```

### Step 2: Setup Firebase (FREE)

1. Go to https://firebase.google.com/
2. Create a new project (FREE)
3. Enable these services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   - Cloud Messaging
4. Download `google-services.json` for Android
5. Download `GoogleService-Info.plist` for iOS
6. Copy configuration to `mobile-app/firebase-config.js`

### Step 3: Setup Backend (Optional - if using Node.js)

```bash
cd backend
npm install
```

### Step 4: Run the App

```bash
# Start Expo development server
cd mobile-app
npx expo start

# Options:
# - Press 'a' for Android emulator
# - Press 'w' for web browser
# - Scan QR code with Expo Go app on your phone
```

## 🔥 Firebase Configuration

Create `mobile-app/firebase-config.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## 📦 Building APK for Play Store

```bash
# Build Android APK
cd mobile-app
eas build --platform android

# Or build locally
npx expo build:android
```

## 💰 Cost Breakdown (FREE!)

All services used are **100% FREE** for small to medium apps:

- ✅ Firebase Free Tier: 50K reads, 20K writes per day
- ✅ Firebase Storage: 5GB free
- ✅ Firebase Authentication: Unlimited users
- ✅ Expo: FREE for development and building
- ✅ React Native: FREE and open source
- ✅ Hosting: FREE on Firebase/Vercel

## 📊 Database Structure

### Collections:

1. **users** - User profiles
2. **memberships** - Membership plans
3. **subscriptions** - User subscriptions
4. **workouts** - Workout plans
5. **exercises** - Exercise library
6. **attendance** - Check-in records
7. **payments** - Payment history
8. **body_metrics** - Progress tracking

## 🚀 Deployment

### Android APK:
```bash
eas build --platform android --profile production
```

### Play Store:
1. Create Google Play Console account ($25 one-time)
2. Upload APK
3. Fill app details
4. Submit for review

## 📝 Environment Setup

Create `.env` file in `mobile-app/`:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
```

## 🤝 Support

For issues or questions, contact: support@sgfitnessevolution.com

## 📄 License

MIT License - Free to use and modify

---

**Built with ❤️ for SG Fitness Evolution**
