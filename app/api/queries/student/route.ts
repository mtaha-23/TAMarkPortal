import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { normalizeRollNumber } from "@/lib/utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rollNo = searchParams.get("rollNo")

    if (!rollNo) {
      return NextResponse.json({ error: "Roll number required" }, { status: 400 })
    }

    // Normalize roll number (uppercase, proper formatting)
    const normalizedRollNo = normalizeRollNumber(rollNo)

    // Get all queries for this student
    const q = query(
      collection(db, "queries"),
      where("rollNo", "==", normalizedRollNo)
    )
    
    const querySnapshot = await getDocs(q)
    
    const queries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as any))

    // Sort by createdAt in JavaScript instead of Firestore
    queries.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })

    return NextResponse.json({ success: true, queries })
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to fetch queries"
    }, { status: 500 })
  }
}
