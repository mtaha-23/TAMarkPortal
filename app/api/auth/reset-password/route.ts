import { NextResponse } from "next/server"
import { auth } from "@/lib/firebase"
import { sendPasswordResetEmail } from "firebase/auth"
import { rollNumberToEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { rollNo } = await request.json()

    if (!rollNo) {
      return NextResponse.json({ error: "Roll number required" }, { status: 400 })
    }

    // Convert roll number to email
    const email = rollNumberToEmail(rollNo)

    // Send password reset email through Firebase Auth
    // This will send an email to the user with a link to reset their password
    await sendPasswordResetEmail(auth, email)

    console.log(`Password reset email sent to ${email}`)

    return NextResponse.json({
      success: true,
      email,
      message: `A password reset link has been sent to ${email}. Please check your email.`,
    })
  } catch (error: any) {
    console.error("Password reset error:", error)
    
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
