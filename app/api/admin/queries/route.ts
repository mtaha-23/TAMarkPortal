import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs, orderBy, query as firestoreQuery } from "firebase/firestore"

export async function GET() {
  try {
    // Get all queries ordered by creation date
    const q = firestoreQuery(
      collection(db, "queries"),
      orderBy("createdAt", "desc")
    )
    
    const querySnapshot = await getDocs(q)
    const queries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ success: true, queries })
  } catch (error) {
    console.error("Error fetching all queries:", error)
    return NextResponse.json({ error: "Failed to fetch queries" }, { status: 500 })
  }
}

