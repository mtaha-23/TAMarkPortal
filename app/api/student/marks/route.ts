import { NextResponse } from "next/server"
import { getStudentMarks } from "@/lib/csv-parser"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rollNo = searchParams.get("rollNo")

    if (!rollNo) {
      return NextResponse.json({ error: "Roll number required" }, { status: 400 })
    }

    // Get marks directly from CSV files
    const courses = await getStudentMarks(rollNo)

    if (courses.length === 0) {
      return NextResponse.json({ error: "No marks found for this roll number" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      rollNo,
      name: courses[0].name,
      courses,
    })
  } catch (error) {
    console.error("Error fetching marks:", error)
    return NextResponse.json({ error: "Failed to fetch marks" }, { status: 500 })
  }
}
