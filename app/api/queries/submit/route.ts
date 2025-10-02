import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"
import { QueryStatus } from "@/lib/admin"
import { normalizeRollNumber } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const { rollNo, name, email, courses, subject, message } = await request.json()

    if (!rollNo || !subject || !message) {
      return NextResponse.json({ 
        error: "Roll number, subject, and message are required" 
      }, { status: 400 })
    }

    // Normalize roll number (uppercase, proper formatting)
    const normalizedRollNo = normalizeRollNumber(rollNo)

    // Create query in Firestore
    const queryDoc = await addDoc(collection(db, "queries"), {
      rollNo: normalizedRollNo,
      name,
      email,
      courses: courses || "Unknown",
      subject,
      message,
      status: QueryStatus.OPEN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminResponse: null,
      adminComment: null,
      hasUnreadResponse: false, // Track if student has read TA response
      responseReadAt: null,
    })

    return NextResponse.json({
      success: true,
      queryId: queryDoc.id,
      message: "Query submitted successfully",
    })
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to submit query" 
    }, { status: 500 })
  }
}

