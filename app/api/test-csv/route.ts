import { NextResponse } from "next/server"
import { getAllCSVFiles, findStudentInCSVs } from "@/lib/csv-parser"

export async function GET() {
  try {
    const files = await getAllCSVFiles()
    
    return NextResponse.json({
      success: true,
      cwd: process.cwd(),
      filesFound: files.length,
      files: files,
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack",
      cwd: process.cwd(),
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { rollNo } = await request.json()
    const result = await findStudentInCSVs(rollNo || "22F-0504")
    
    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack",
    }, { status: 500 })
  }
}

