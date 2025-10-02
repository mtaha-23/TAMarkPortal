import { NextResponse } from "next/server"
import { db, auth } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { getAllCSVFiles, parseCSVFile } from "@/lib/csv-parser"
import { rollNumberToEmail, generateRandomPassword } from "@/lib/email"
import { isAdmin } from "@/lib/admin"
import { normalizeRollNumber } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const { adminEmail } = await request.json()

    // Verify admin
    if (!isAdmin(adminEmail)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get all CSV files
    const csvFiles = await getAllCSVFiles()
    if (csvFiles.length === 0) {
      return NextResponse.json({ error: "No CSV files found" }, { status: 404 })
    }

    const registeredStudents = []
    const errors = []
    const alreadyRegistered = []

    // Parse all CSV files and collect unique students
    const studentMap = new Map()

    for (const file of csvFiles) {
      const { fileName, rows } = await parseCSVFile(file)
      
      for (const row of rows) {
        const rollNo = row["Roll No."]
        const name = row["Name"]
        
        if (!rollNo || !name) continue

        // Normalize roll number (uppercase, proper formatting)
        const normalizedRollNo = normalizeRollNumber(rollNo)

        if (!studentMap.has(normalizedRollNo)) {
          studentMap.set(normalizedRollNo, {
            rollNo: normalizedRollNo,
            name,
            courses: [fileName]
          })
        } else {
          studentMap.get(normalizedRollNo).courses.push(fileName)
        }
      }
    }

    // Register each unique student
    for (const [rollNo, studentData] of studentMap) {
      try {
        // Roll number is already normalized from the map
        const email = rollNumberToEmail(rollNo)
        
        // Check if already registered
        const userDocRef = doc(db, "users", rollNo)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
          alreadyRegistered.push({ rollNo, name: studentData.name })
          continue
        }

        // Generate random password
        const password = generateRandomPassword(10)

        // Create Firebase Auth account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        // Store in Firestore
        await setDoc(userDocRef, {
          rollNo,
          name: studentData.name,
          email,
          uid: userCredential.user.uid,
          courses: studentData.courses,
          createdAt: new Date().toISOString(),
          registeredBy: "TA",
          initialPassword: password,
        })

        registeredStudents.push({
          rollNo,
          name: studentData.name,
          email,
          password, // Will be sent via email
          courses: studentData.courses.join(", ")
        })

      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          alreadyRegistered.push({ rollNo, name: studentData.name })
        } else {
          errors.push({ rollNo, error: "Registration failed" })
        }
      }
    }

    return NextResponse.json({
      success: true,
      total: studentMap.size,
      registered: registeredStudents.length,
      alreadyRegistered: alreadyRegistered.length,
      errors: errors.length,
      students: registeredStudents, // TA will use this to send emails
      skipped: alreadyRegistered,
    })

  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}

