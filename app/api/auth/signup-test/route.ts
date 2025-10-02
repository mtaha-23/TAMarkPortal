import { NextResponse } from "next/server"
import { findStudentInCSVs } from "@/lib/csv-parser"

// Temporary test endpoint without Firebase
export async function POST(request: Request) {
  try {
    const { rollNo, password } = await request.json()
    
    console.log("Testing signup for:", rollNo)

    if (!rollNo || !password) {
      return NextResponse.json({ error: "Roll number and password required" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if roll number exists in CSV files
    console.log("Searching for student in CSV...")
    const studentInfo = await findStudentInCSVs(rollNo)
    console.log("Search result:", studentInfo)

    if (!studentInfo.found) {
      return NextResponse.json({ error: "Roll number not found in records" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Student found in CSV! (Firebase disabled for test)",
      student: {
        rollNo,
        name: studentInfo.name,
      },
    })
  } catch (error) {
    console.error("Signup test error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ 
      error: "Signup test failed", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

