import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

export async function GET() {
  try {
    // Get all queries
    const querySnapshot = await getDocs(collection(db, "queries"))
    
    const queries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as any))

    // Sort by createdAt in JavaScript
    queries.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })

    return NextResponse.json({ success: true, queries })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch queries" }, { status: 500 })
  }
}

