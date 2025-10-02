# Firebase Authentication Setup

## Required Steps

### 1. Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Authentication** in the left sidebar
4. Click **Get Started** (if first time)
5. Go to **Sign-in method** tab
6. Click on **Email/Password**
7. **Enable** the first toggle (Email/Password)
8. Click **Save**

### 2. Configure Email Templates (Optional but Recommended)

1. In Firebase Authentication, go to **Templates** tab
2. Click **Password reset**
3. Customize the email template:
   - **From name**: Student Marks Portal
   - **Reply-to email**: Your email
   - Edit the subject and body as needed
4. Click **Save**

### 3. Firestore Security Rules

Make sure your Firestore has proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only authenticated users can read their own data
    match /users/{rollNo} {
      allow read: if request.auth != null && request.auth.token.email == resource.data.email;
      allow write: if request.auth != null && request.auth.token.email == resource.data.email;
      allow create: if request.auth != null;
    }
  }
}
```

## How It Works Now

### Signup
1. Student enters roll number (e.g., `22F-3277`) and password
2. System converts roll number to email: `f223277@cfd.nu.edu.pk`
3. Creates Firebase Auth user with that email
4. Stores metadata in Firestore (name, rollNo, uid)
5. **No password is stored in Firestore** - Firebase Auth handles it securely!

### Login
1. Student enters roll number and password
2. System converts to email and authenticates with Firebase Auth
3. Returns student data from Firestore

### Password Reset
1. Student enters roll number
2. System converts to email
3. **Firebase sends password reset email automatically** with a secure link
4. Student clicks link → resets password → can login

## Benefits

✅ **Secure**: Passwords are hashed and managed by Firebase  
✅ **Built-in email**: Firebase sends password reset emails automatically  
✅ **No custom email service needed**: No Resend API required  
✅ **Better UX**: Professional password reset flow with secure links  
✅ **Industry standard**: Battle-tested authentication system

