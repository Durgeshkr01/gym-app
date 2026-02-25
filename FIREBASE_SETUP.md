# Firebase Setup Guide

## चरण 1: Firebase Project बनाएं

1. https://console.firebase.google.com/ पर जाएं
2. "Add project" क्लिक करें
3. Project name: **SG-Fitness-Evolution**
4. Google Analytics enable करें (optional)
5. Create project

## चरण 2: Firebase Services Enable करें

### Authentication
```
1. Firebase Console → Authentication
2. "Get Started" क्लिक करें
3. Sign-in method → Email/Password → Enable
4. Save
```

### Firestore Database
```
1. Firebase Console → Firestore Database
2. "Create database"
3. Start in "test mode" (development के लिए)
4. Location: asia-south1 (Mumbai, India) ✅
5. Enable
```

### Storage
```
1. Firebase Console → Storage
2. "Get Started"
3. Start in test mode
4. Done
```

### Cloud Messaging (Push Notifications)
```
1. Firebase Console → Cloud Messaging
2. Already enabled by default
```

## चरण 3: Firestore Database Structure बनाएं

Firebase Console → Firestore Database → Data tab

### Collections बनाएं:

#### 1. **users**
```javascript
{
  "uid": "user_id_here",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "role": "member", // member, trainer, admin
  "membershipStatus": "active", // active, inactive, expired
  "profileImage": null,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

#### 2. **membershipPlans**
```javascript
{
  "name": "Monthly Plan",
  "duration": 1, // months
  "price": 1500,
  "features": [
    "Access to gym equipment",
    "1 trainer session per week",
    "Diet consultation"
  ],
  "isActive": true,
  "createdAt": Timestamp
}
```

#### 3. **subscriptions**
```javascript
{
  "userId": "user_id",
  "planId": "plan_id",
  "startDate": "2024-02-01",
  "endDate": "2024-03-01",
  "status": "active", // active, expired, cancelled
  "paymentId": "payment_id",
  "amount": 1500,
  "createdAt": Timestamp
}
```

#### 4. **workouts**
```javascript
{
  "name": "Upper Body Strength",
  "category": "Strength", // Strength, Cardio, Flexibility
  "difficulty": "Intermediate", // Beginner, Intermediate, Advanced
  "duration": 45, // minutes
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 3,
      "reps": 10,
      "rest": 60, // seconds
      "instructions": "Keep back flat..."
    }
  ],
  "createdBy": "trainer_id",
  "createdAt": Timestamp
}
```

#### 5. **exercises**
```javascript
{
  "name": "Bench Press",
  "category": "Chest",
  "equipment": "Barbell",
  "difficulty": "Intermediate",
  "instructions": "Detailed instructions...",
  "videoUrl": "https://youtube.com/...",
  "imageUrl": "https://...",
  "muscleGroups": ["Chest", "Triceps", "Shoulders"],
  "createdAt": Timestamp
}
```

#### 6. **attendance**
```javascript
{
  "userId": "user_id",
  "date": "2024-02-20",
  "checkIn": Timestamp,
  "checkOut": Timestamp,
  "duration": 90 // minutes
}
```

#### 7. **body_metrics**
```javascript
{
  "userId": "user_id",
  "date": "2024-02-20",
  "weight": 70.5, // kg
  "height": 175, // cm
  "bmi": 23.0,
  "measurements": {
    "chest": 100,
    "waist": 85,
    "arms": 35,
    "legs": 60
  },
  "createdAt": Timestamp
}
```

#### 8. **payments**
```javascript
{
  "userId": "user_id",
  "subscriptionId": "subscription_id",
  "amount": 1500,
  "method": "cash", // cash, card, upi, online
  "status": "completed", // pending, completed, failed
  "transactionId": "txn_123",
  "createdAt": Timestamp
}
```

## चरण 4: Firestore Security Rules

Firebase Console → Firestore Database → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || isAdmin();
    }
    
    // Membership plans (public read, admin write)
    match /membershipPlans/{planId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Subscriptions
    match /subscriptions/{subscriptionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
    
    // Workouts (public read, trainer/admin write)
    match /workouts/{workoutId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Exercises (public read)
    match /exercises/{exerciseId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Attendance
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
    
    // Body Metrics
    match /body_metrics/{metricId} {
      allow read, write: if isAuthenticated();
    }
    
    // Payments
    match /payments/{paymentId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

## चरण 5: Storage Rules

Firebase Console → Storage → Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Profile images
    match /profile_images/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Exercise images/videos
    match /exercises/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Workout images
    match /workouts/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## चरण 6: Firebase Configuration निकालें

### For Mobile App:

1. Firebase Console → Project Settings (⚙️)
2. Scroll down → "Your apps" section
3. Click Android icon (</>) या iOS icon
4. Register app:
   - **Android package name**: `com.sgfitness.evolution`
   - **iOS bundle ID**: `com.sgfitness.evolution`
5. Download configuration file:
   - **Android**: `google-services.json`
   - **iOS**: `GoogleService-Info.plist`
   - **Web/React Native**: Copy the `firebaseConfig` object

### Firebase Config Example:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "sg-fitness-evolution.firebaseapp.com",
  projectId: "sg-fitness-evolution",
  storageBucket: "sg-fitness-evolution.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:android:abc...",
  measurementId: "G-ABC123"
};
```

Update this in: `mobile-app/firebase-config.js`

## चरण 7: Add Sample Data

Firebase Console → Firestore → Start collection

### Sample Membership Plans:

```javascript
// Plan 1
{
  name: "Monthly Plan",
  duration: 1,
  price: 1500,
  features: ["Gym Access", "1 Trainer Session/Week"],
  isActive: true
}

// Plan 2
{
  name: "Quarterly Plan",
  duration: 3,
  price: 4000,
  features: ["Gym Access", "2 Trainer Sessions/Week", "Diet Plan"],
  isActive: true
}

// Plan 3
{
  name: "Yearly Plan",
  duration: 12,
  price: 15000,
  features: ["Gym Access", "Unlimited Trainer Sessions", "Diet Plan", "Personal Locker"],
  isActive: true
}
```

## चरण 8: Backend Setup (Optional)

If using Node.js backend:

1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Rename to `serviceAccountKey.json`
5. Move to `backend/` folder
6. Update `backend/config/firebase.js` with your storage bucket name

## Testing

### Test Firebase Connection:

```bash
cd mobile-app
npx expo start
```

Try to:
- ✅ Register new user
- ✅ Login
- ✅ Check Firestore for user data
- ✅ Upload profile image to Storage

## Free Tier Limits

Firebase FREE tier includes:
- **Authentication**: Unlimited users ✅
- **Firestore**: 50K reads, 20K writes, 20K deletes per day ✅
- **Storage**: 5GB storage, 1GB/day downloads ✅
- **Hosting**: 10GB storage, 360MB/day transfer ✅

**यह limits 100-200 members वाली gym के लिए काफी हैं!** 🎉

## Troubleshooting

### Error: "Permission denied"
- Check Firestore Security Rules
- Verify user is authenticated

### Error: "Storage upload failed"
- Check Storage Rules
- Verify file size < 5MB

### Error: "API key invalid"
- Verify `firebaseConfig` in `firebase-config.js`
- Check API key restrictions in Firebase Console

---

**Setup complete! Ab aap app use kar sakte hain! 🚀**
