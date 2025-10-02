import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

export async function POST(request: Request) {
  try {
    const { queryId } = await request.json()

    if (!queryId) {
      return NextResponse.json({ error: "Query ID required" }, { status: 400 })
    }

    // Mark response as read
    await updateDoc(doc(db, "queries", queryId), {
      hasUnreadResponse: false,
      responseReadAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking query as read:", error)
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 })
  }
}

