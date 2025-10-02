import { NextResponse } from "next/server"
import { db, auth } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { rollNumberToEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { rollNo, password } = await request.json()

    if (!rollNo || !password) {
      return NextResponse.json({ error: "Roll number and password required" }, { status: 400 })
    }

    // Convert roll number to email
    const email = rollNumberToEmail(rollNo)

    // Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user data from Firestore
    const userDocRef = doc(db, "users", rollNo)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User data not found. Please signup first." }, { status: 404 })
    }

    const userData = userDoc.data()

    return NextResponse.json({
      success: true,
      student: {
        rollNo: userData.rollNo,
        name: userData.name,
        email: userData.email,
      },
    })
  } catch (error: any) {
    console.error("Login error:", error)
    
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
