# Student Marks Portal

A secure portal for students to view their course marks. Built with Next.js, Firebase, and Tailwind CSS.

## Features

- Self-service signup: Students can register if their roll number exists in CSV files
- Secure login with roll number and password
- Real-time marks viewing: Marks are read directly from CSV files (no database storage)
- Password reset via email
- Multiple course support

## Setup Instructions

### 1. Firebase Configuration

Create a Firebase project and add the following environment variables:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

### 2. Email Service Configuration

For password reset emails, add:

\`\`\`env
RESEND_API_KEY=your_resend_api_key
\`\`\`

Or configure your preferred email service in `lib/email-service.ts`


### 4. Add CSV Files

Place your CSV files in the `CSV_Files/` folder at the workspace root (same level as `my-app/`).

Example structure:

```
marks-portal/
  CSV_Files/
    Fall 2025 - SE 5E.csv
    Fall 2025 - DB 5A.csv
    Fall 2025 - SE 5F.csv
  my-app/
    ...
```

CSV files must have these columns:
- `Sr No.` - Serial number
- `Roll No.` - Student roll number (e.g., 22F-3277)
- `Name` - Student name
- Assessment columns (e.g., `Q1 (15)`, `A1 (100)`, etc.)

### 5. How It Works

**Signup Flow:**
1. Student visits `/signup`
2. Enters roll number (e.g., `22F-3277`) and creates a password
3. System checks if roll number exists in any CSV file
4. If found, creates account in Firebase `users` collection with `{ rollNo, password, name }`
5. Student is redirected to dashboard

**Login Flow:**
1. Student enters roll number and password
2. System verifies credentials against Firebase `users` collection
3. On success, redirects to dashboard

**Dashboard:**
1. Fetches marks in real-time from CSV files (nothing stored in database)
2. Displays all courses the student is enrolled in
3. Shows assessments and scores for each course

## Security Notes

⚠️ **Important**: This is a demonstration project. For production use:

1. Hash passwords using bcrypt or similar
2. Implement proper session management with secure tokens
3. Add rate limiting for login attempts
4. Use HTTPS only
5. Implement CSRF protection
6. Add proper error handling and logging
7. Validate all user inputs
8. Use environment variables for all sensitive data

## Usage

### For Students

1. **Signup:** Visit `/signup`, enter your roll number and create a password
2. **Login:** Visit `/login`, enter credentials
3. **View Marks:** Dashboard shows all your courses and marks in real-time from CSV files
4. **Reset Password:** Click "Forgot password?" on login page

### For Admins

1. Add CSV files to `CSV_Files/` folder
2. Students can immediately signup if their roll number is in the CSV
3. No import or database seeding needed - marks are read on-the-fly

## Data Storage

- **Firebase Firestore:** Only stores user authentication data (`users` collection with `rollNo`, `password`, `name`)
- **CSV Files:** All marks data stays in CSV files and is read in real-time
- **No marks in database:** Easier to update - just replace the CSV file!
