import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limitCount = parseInt(searchParams.get("limit") || "100")

    // Get activity logs
    const querySnapshot = await getDocs(collection(db, "activity_logs"))
    
    let logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as any))

    // Sort by timestamp in JavaScript
    logs.sort((a: any, b: any) => {
      const dateA = new Date(a.timestamp || 0).getTime()
      const dateB = new Date(b.timestamp || 0).getTime()
      return dateB - dateA
    })

    // Apply limit
    logs = logs.slice(0, limitCount)

    return NextResponse.json({ success: true, logs })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}

