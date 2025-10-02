import { NextResponse } from "next/server"
import { getStudentMarks } from "@/lib/csv-parser"
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

    // Get marks directly from CSV files
    const courses = await getStudentMarks(normalizedRollNo)

    if (courses.length === 0) {
      return NextResponse.json({ error: "No marks found for this roll number" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      rollNo: normalizedRollNo,
      name: courses[0].name,
      courses,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch marks" }, { status: 500 })
  }
}
