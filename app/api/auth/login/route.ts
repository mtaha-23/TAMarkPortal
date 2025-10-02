import { NextResponse } from "next/server"
import { db, auth } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, collection, addDoc } from "firebase/firestore"
import { rollNumberToEmail } from "@/lib/email"
import { ActivityType } from "@/lib/admin"
import { normalizeRollNumber } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const { rollNo, password } = await request.json()

    if (!rollNo || !password) {
      return NextResponse.json({ error: "Roll number and password required" }, { status: 400 })
    }

    // Normalize roll number (uppercase, proper formatting)
    const normalizedRollNo = normalizeRollNumber(rollNo)

    // Convert roll number to email
    const email = rollNumberToEmail(normalizedRollNo)

    // Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user data from Firestore
    const userDocRef = doc(db, "users", normalizedRollNo)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User data not found. Please signup first." }, { status: 404 })
    }

    const userData = userDoc.data()

    // Log activity
    await addDoc(collection(db, "activity_logs"), {
      rollNo: userData.rollNo,
      name: userData.name,
      email: userData.email,
      activityType: ActivityType.LOGIN,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent") || "Unknown",
    })

    return NextResponse.json({
      success: true,
      student: {
        rollNo: userData.rollNo,
        name: userData.name,
        email: userData.email,
      },
    })
  } catch (error: any) {
    // Handle specific Firebase Auth errors
    if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found") {
      return NextResponse.json({ error: "Invalid credentials. Please check your roll number and password." }, { status: 401 })
    }
    if (error.code === "auth/wrong-password") {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }
    
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
