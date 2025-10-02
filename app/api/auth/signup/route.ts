import { NextResponse } from "next/server"
import { db, auth } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { findStudentInCSVs } from "@/lib/csv-parser"
import { rollNumberToEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { rollNo, password } = await request.json()

    if (!rollNo || !password) {
      return NextResponse.json({ error: "Roll number and password required" }, { status: 400 })
    }

    // Validate password strength (Firebase requires min 6 characters)
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Convert roll number to email (e.g., 22F-3277 -> f223277@cfd.nu.edu.pk)
    const email = rollNumberToEmail(rollNo)

    // Check if roll number exists in CSV files
    const studentInfo = await findStudentInCSVs(rollNo)

    if (!studentInfo.found) {
      return NextResponse.json({ error: "Roll number not found in records" }, { status: 404 })
    }

    // Check if user already exists in Firestore
    const userDocRef = doc(db, "users", rollNo)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      return NextResponse.json({ error: "User already registered. Please login." }, { status: 409 })
    }

    // Create Firebase Auth user with generated email
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Store user metadata in Firestore (no password stored here!)
    await setDoc(userDocRef, {
      rollNo,
      name: studentInfo.name,
      email,
      uid: user.uid,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      student: {
        rollNo,
        name: studentInfo.name,
        email,
      },
    })
  } catch (error: any) {
    console.error("Signup error:", error)
    
    // Handle specific Firebase Auth errors
    if (error.code === "auth/email-already-in-use") {
      return NextResponse.json({ error: "User already registered. Please login." }, { status: 409 })
    }
    
    return NextResponse.json({ 
      error: "Signup failed", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

