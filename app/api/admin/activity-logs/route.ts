import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy, limit as fbLimit } from "firebase/firestore"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limitCount = parseInt(searchParams.get("limit") || "100")

    // Get activity logs sorted by timestamp desc and limited at the DB level
    const q = query(
      collection(db, "activity_logs"),
      orderBy("timestamp", "desc"),
      fbLimit(limitCount)
    )
    const querySnapshot = await getDocs(q)

    const logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as any))

    return NextResponse.json({ success: true, logs })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}

