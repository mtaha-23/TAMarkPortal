import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { QueryStatus } from "@/lib/admin"

export async function POST(request: Request) {
  try {
    const { queryId, status, adminResponse, adminComment } = await request.json()

    if (!queryId) {
      return NextResponse.json({ error: "Query ID required" }, { status: 400 })
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    if (status) updateData.status = status
    if (adminResponse !== undefined) {
      updateData.adminResponse = adminResponse
      // Mark as unread if TA added/updated response
      if (adminResponse) {
        updateData.hasUnreadResponse = true
        updateData.responseReadAt = null
      }
    }
    if (adminComment !== undefined) updateData.adminComment = adminComment

    // Update query in Firestore
    await updateDoc(doc(db, "queries", queryId), updateData)

    return NextResponse.json({
      success: true,
      message: "Query updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update query" }, { status: 500 })
  }
}

