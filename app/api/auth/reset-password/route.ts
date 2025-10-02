import { NextResponse } from "next/server"
import { auth, db } from "@/lib/firebase"
import { sendPasswordResetEmail } from "firebase/auth"
import { rollNumberToEmail } from "@/lib/email"
import { doc, getDoc } from "firebase/firestore"

export async function POST(request: Request) {
  try {
    const { rollNo } = await request.json()

    if (!rollNo) {
      return NextResponse.json({ error: "Roll number required" }, { status: 400 })
    }

    // Check if user is registered in Firestore (prevents misleading success message)
    const userDoc = await getDoc(doc(db, "users", rollNo))
    if (!userDoc.exists()) {
      return NextResponse.json({ error: "No account found with this roll number. Please contact your TA." }, { status: 404 })
    }

    // Convert roll number to email
    const email = rollNumberToEmail(rollNo)

    // Send password reset email through Firebase Auth
    await sendPasswordResetEmail(auth, email)

    return NextResponse.json({
      success: true,
      message: `A password reset link has been sent to your email. Please check your inbox.`,
    })
  } catch (error: any) {
    // Handle specific errors
    if (error.code === "auth/user-not-found") {
      return NextResponse.json({ 
        error: "No account found with this roll number. Please signup first." 
      }, { status: 404 })
    }
    
    if (error.code === "auth/invalid-email") {
      return NextResponse.json({ 
        error: "Invalid roll number format" 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: "Password reset failed. Please try again." 
    }, { status: 500 })
  }
}
