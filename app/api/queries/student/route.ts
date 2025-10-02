import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rollNo = searchParams.get("rollNo")

    if (!rollNo) {
      return NextResponse.json({ error: "Roll number required" }, { status: 400 })
    }

    console.log("Fetching queries for rollNo:", rollNo)

    // Get all queries for this student
    const q = query(
      collection(db, "queries"),
      where("rollNo", "==", rollNo)
    )
    
    const querySnapshot = await getDocs(q)
    console.log("Found queries:", querySnapshot.docs.length)
    
    const queries = querySnapshot.docs.map(doc => {
      const data = doc.data()
      console.log("Query data:", data)
      return {
        id: doc.id,
        ...data
      } as any
    })

    // Sort by createdAt in JavaScript instead of Firestore
    queries.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })

    return NextResponse.json({ success: true, queries })
  } catch (error) {
    console.error("Error fetching student queries:", error)
    return NextResponse.json({ 
      error: "Failed to fetch queries",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
