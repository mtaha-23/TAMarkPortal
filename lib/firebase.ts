import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase configuration is missing! Please check your .env.local file")
  console.error("Config values:", {
    apiKey: firebaseConfig.apiKey ? "SET" : "MISSING",
    authDomain: firebaseConfig.authDomain ? "SET" : "MISSING",
    projectId: firebaseConfig.projectId ? "SET" : "MISSING",
    storageBucket: firebaseConfig.storageBucket ? "SET" : "MISSING",
    messagingSenderId: firebaseConfig.messagingSenderId ? "SET" : "MISSING",
    appId: firebaseConfig.appId ? "SET" : "MISSING",
  })
  throw new Error("Firebase configuration is incomplete. Please check your .env.local file.")
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }
