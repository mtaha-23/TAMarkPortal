import { NextResponse } from "next/server"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { isAdmin } from "@/lib/admin"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    // Check if email is admin
    if (!isAdmin(email)) {
      return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 })
    }

    // Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    return NextResponse.json({
      success: true,
      admin: {
        email: user.email,
        uid: user.uid,
      },
    })
  } catch (error: any) {
    if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}

