import { NextResponse } from "next/server"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth"
import { rollNumberToEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { rollNo, currentPassword, newPassword } = await request.json()

    if (!rollNo || !currentPassword || !newPassword) {
      return NextResponse.json({ 
        error: "Roll number, current password, and new password are required" 
      }, { status: 400 })
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return NextResponse.json({ 
        error: "New password must be at least 6 characters" 
      }, { status: 400 })
    }

    // Convert roll number to email
    const email = rollNumberToEmail(rollNo)

    // Re-authenticate user with current password
    const userCredential = await signInWithEmailAndPassword(auth, email, currentPassword)
    const user = userCredential.user

    // Update to new password
    await updatePassword(user, newPassword)

    console.log(`Password updated successfully for ${rollNo}`)

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error: any) {
    console.error("Change password error:", error)
    
    // Handle specific errors
    if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      return NextResponse.json({ 
        error: "Current password is incorrect" 
      }, { status: 401 })
    }
    
    if (error.code === "auth/user-not-found") {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 })
    }
    
    if (error.code === "auth/weak-password") {
      return NextResponse.json({ 
        error: "New password is too weak" 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: "Failed to change password. Please try again." 
    }, { status: 500 })
  }
}

