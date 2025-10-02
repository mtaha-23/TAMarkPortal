import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limitCount = parseInt(searchParams.get("limit") || "100")

    // Get activity logs ordered by timestamp
    const q = query(
      collection(db, "activity_logs"),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ success: true, logs })
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}

