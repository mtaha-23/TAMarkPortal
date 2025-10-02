import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"
import { ActivityType } from "@/lib/admin"

export async function POST(request: Request) {
  try {
    const { rollNo, name, email } = await request.json()

    if (!rollNo) {
      return NextResponse.json({ error: "Roll number required" }, { status: 400 })
    }

    // Log logout activity
    await addDoc(collection(db, "activity_logs"), {
      rollNo,
      name: name || "Unknown",
      email: email || "Unknown",
      activityType: ActivityType.LOGOUT,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent") || "Unknown",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout logging error:", error)
    // Don't fail logout if logging fails
    return NextResponse.json({ success: true })
  }
}

