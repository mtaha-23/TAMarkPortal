import { promises as fs } from "fs"
import path from "path"

// Get the CSV directory path
function getCSVDir() {
  // Check if CSV_Files is in the my-app directory first
  const localPath = path.join(process.cwd(), "CSV_Files")
  const parentPath = path.resolve(process.cwd(), "..", "CSV_Files")
  
  console.log("Current working directory:", process.cwd())
  console.log("Checking local path:", localPath)
  console.log("Checking parent path:", parentPath)
  
  // We'll try the local path first (my-app/CSV_Files)
  return localPath
}

// Parse a single CSV file
export async function parseCSVFile(filePath: string) {
  const fileName = path.basename(filePath, path.extname(filePath))
  const buffer = await fs.readFile(filePath)
  const text = buffer.toString("utf-8")
  
  const lines = text.split("\n").filter((line) => line.trim())
  if (lines.length === 0) return { fileName, headers: [], rows: [] }

  const headers = lines[0].split(",").map((h) => h.trim())
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })
    rows.push(row)
  }

  return { fileName, headers, rows }
}

// Get all CSV files
export async function getAllCSVFiles() {
  const csvDir = getCSVDir()
  try {
    const dirents = await fs.readdir(csvDir, { withFileTypes: true })
    return dirents
      .filter((d) => d.isFile() && d.name.toLowerCase().endsWith(".csv"))
      .map((d) => path.join(csvDir, d.name))
  } catch (e) {
    console.error("Failed to read CSV directory:", csvDir, e)
    return []
  }
}

// Check if a roll number exists in any CSV file
export async function findStudentInCSVs(rollNo: string) {
  try {
    const files = await getAllCSVFiles()
    console.log("Found CSV files:", files)
    
    if (files.length === 0) {
      console.error("No CSV files found!")
      return { found: false }
    }
    
    for (const file of files) {
      console.log("Checking file:", file)
      const { fileName, rows } = await parseCSVFile(file)
      const student = rows.find((row) => row["Roll No."] === rollNo)
      
      if (student) {
        console.log("Student found:", student)
        return {
          found: true,
          rollNo: student["Roll No."],
          name: student["Name"],
          courseName: fileName,
        }
      }
    }
    
    console.log("Student not found in any CSV:", rollNo)
    return { found: false }
  } catch (error) {
    console.error("Error in findStudentInCSVs:", error)
    throw error
  }
}

// Get all marks for a specific roll number across all CSV files
export async function getStudentMarks(rollNo: string) {
  const files = await getAllCSVFiles()
  const courses = []

  for (const file of files) {
    const { fileName, headers, rows } = await parseCSVFile(file)
    const student = rows.find((row) => row["Roll No."] === rollNo)
    
    if (student) {
      const marks: any = {}
      headers.forEach((header) => {
        if (header !== "Sr No." && header !== "Roll No." && header !== "Name") {
          marks[header] = student[header] || "Not Graded"
        }
      })
      
      courses.push({
        courseName: fileName,
        name: student["Name"],
        marks,
      })
    }
  }

  return courses
}
