import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { isAdmin } from "@/lib/admin"

export async function POST(request: Request) {
  try {
    const { adminEmail } = await request.json()
    if (!isAdmin(adminEmail)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const usersSnap = await getDocs(collection(db, "users"))
    const users: any[] = []
    usersSnap.forEach((docSnap) => {
      const d = docSnap.data() as any
      users.push({
        rollNo: d.rollNo || docSnap.id,
        name: d.name || "",
        email: d.email || "",
        initialPassword: d.initialPassword || "",
        courses: Array.isArray(d.courses) ? d.courses.join(", ") : (d.courses || ""),
        createdAt: d.createdAt || "",
      })
    })

    // Build CSV
    const header = ["Roll No", "Name", "Email", "Initial Password", "Courses", "Created At"]
    const rows = users.map(u => [
      u.rollNo,
      u.name,
      u.email,
      u.initialPassword,
      u.courses,
      u.createdAt,
    ])
    const csv = [header, ...rows].map(r => r.map(v => `${String(v).replace(/"/g, '""')}`).join(",")).join("\n")

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=all-users-${new Date().toISOString().split('T')[0]}.csv`,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: "Failed to export users" }, { status: 500 })
  }
}


