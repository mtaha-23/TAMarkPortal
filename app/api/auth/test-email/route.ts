import { NextResponse } from "next/server"
import { auth } from "@/lib/firebase"
import { sendPasswordResetEmail } from "firebase/auth"
import { rollNumberToEmail } from "@/lib/email"

// Test endpoint to debug email sending
export async function POST(request: Request) {
  try {
    const { rollNo, testEmail } = await request.json()
    
    // If testEmail is provided, use that, otherwise convert rollNo
    const email = testEmail || rollNumberToEmail(rollNo)

    console.log("=== EMAIL RESET TEST ===")
    console.log("Attempting to send to:", email)
    console.log("Firebase Auth instance:", !!auth)
    console.log("Firebase Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)

    await sendPasswordResetEmail(auth, email)

    console.log("✅ Firebase accepted the request")
    console.log("Email should be sent to:", email)
    console.log("=======================")

    return NextResponse.json({
      success: true,
      email,
      message: "Password reset email sent successfully",
      debugInfo: {
        firebaseConfigured: !!auth,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        emailUsed: email,
      }
    })
  } catch (error: any) {
    console.error("=== EMAIL RESET ERROR ===")
    console.error("Error code:", error.code)
    console.error("Error message:", error.message)
    console.error("Full error:", error)
    console.error("========================")

    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      debugInfo: {
        firebaseConfigured: !!auth,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      }
    }, { status: 500 })
  }
}

