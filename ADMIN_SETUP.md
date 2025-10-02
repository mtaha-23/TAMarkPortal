# Admin Portal Setup Guide

## Admin Configuration

### Admin Email
The admin email is configured in `lib/admin.ts`:
```typescript
export const ADMIN_EMAIL = "muhammadtaha2723@gmail.com"
```

## Setup Steps

### 1. Create Admin Account in Firebase

Since the admin uses Firebase Authentication, you need to create the admin account:

**Option A: Using Firebase Console**
1. Go to Firebase Console → Authentication → Users
2. Click "Add User"
3. Email: `muhammadtaha2723@gmail.com`
4. Password: (Set a strong password)
5. Click "Add User"

**Option B: Using the App (Self-Signup)**
1. Visit `/signup` page
2. Use a roll number from your CSV
3. Create an account
4. Then in Firebase Console, change the email to `muhammadtaha2723@gmail.com`

### 2. Access Admin Portal

1. Visit: `http://localhost:3000/admin/login` (or your deployed URL)
2. Login with: `muhammadtaha2723@gmail.com` and your password
3. You'll be redirected to the admin dashboard

## Features

### Activity Logs
- **Login Tracking**: All student logins are logged with timestamp, device info
- **Logout Tracking**: When students logout, it's recorded
- **Real-time Monitoring**: View all activity in chronological order
- **Search**: Filter logs by roll number, name, or activity type

### Query Management System
Students can:
- Submit support queries/questions
- View their query history
- See admin responses
- Track query status (Open, In Progress, Closed)

Admins can:
- View all student queries
- Respond to queries
- Add internal comments (not visible to students)
- Change query status
- Close resolved queries

## Firestore Collections

### `activity_logs`
```javascript
{
  rollNo: string,
  name: string,
  email: string,
  activityType: "login" | "logout" | "password_change" | "password_reset",
  timestamp: ISO8601 string,
  userAgent: string
}
```

### `queries`
```javascript
{
  rollNo: string,
  name: string,
  email: string,
  subject: string,
  message: string,
  status: "open" | "in_progress" | "closed",
  createdAt: ISO8601 string,
  updatedAt: ISO8601 string,
  adminResponse: string | null,
  adminComment: string | null
}
```

## Security

### Firestore Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'muhammadtaha2723@gmail.com';
    }
    
    // Activity logs - Admin read, system write
    match /activity_logs/{logId} {
      allow read: if isAdmin();
      allow write: if true; // API writes these
    }
    
    // Queries - Students can read their own, Admin can read all
    match /queries/{queryId} {
      allow read: if isAdmin() || 
                     (request.auth != null && resource.data.rollNo == request.auth.token.email);
      allow create: if request.auth != null;
      allow update: if isAdmin();
    }
    
    // Users collection
    match /users/{rollNo} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       (request.auth.token.email == resource.data.email || isAdmin());
    }
  }
}
```

## Admin Dashboard Features

### 1. Activity Logs Tab
- View all student login/logout activities
- Real-time timestamp display
- User agent information
- Search and filter capabilities

### 2. Student Queries Tab
- See all support tickets
- Badge showing count of open queries
- Respond to queries
- Add internal admin comments
- Change status (Open → In Progress → Closed)
- Search queries by student or subject

## Student Features

### Support Page (`/queries`)
- Submit new queries
- View query history
- See admin responses
- Track query status

### Dashboard Updates
- "Support" button added to header
- Logout tracking integrated
- Seamless navigation

## URLs

- **Admin Login**: `/admin/login`
- **Admin Dashboard**: `/admin/dashboard`
- **Student Support**: `/queries`

## Best Practices

1. **Regular Monitoring**: Check activity logs daily for unusual patterns
2. **Quick Response**: Respond to student queries within 24 hours
3. **Internal Comments**: Use admin comments for notes and tracking
4. **Status Updates**: Update query status to keep students informed
5. **Security**: Never share admin credentials

## Troubleshooting

**Can't login as admin?**
- Verify email is exactly: `muhammadtaha2723@gmail.com`
- Check Firebase Console → Authentication → Users
- Ensure account exists with correct email

**Activity logs not showing?**
- Check Firestore rules are configured
- Verify `activity_logs` collection exists
- Check browser console for errors

**Queries not appearing?**
- Verify Firestore security rules
- Check `queries` collection in Firestore
- Ensure proper permissions


