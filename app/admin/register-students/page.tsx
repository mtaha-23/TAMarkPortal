"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, UserPlus, Download } from "lucide-react"
import Link from "next/link"

interface Student {
  rollNo: string
  name: string
  email: string
  password: string
  courses: string
}

export default function RegisterStudentsPage() {
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleRegister = async () => {
    setLoading(true)
    setError("")
    setStudents([])
    setStats(null)

    try {
      const adminData = localStorage.getItem("admin")
      if (!adminData) {
        router.push("/admin/login")
        return
      }

      const admin = JSON.parse(adminData)

      const response = await fetch("/api/admin/register-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail: admin.email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStudents(data.students || [])
        setStats({
          total: data.total,
          registered: data.registered,
          alreadyRegistered: data.alreadyRegistered,
          errors: data.errors,
        })
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      setError("An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    const csv = [
      ["Roll No", "Name", "Email", "Password", "Courses"],
      ...students.map(s => [s.rollNo, s.name, s.email, s.password, s.courses])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `student-credentials-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const downloadAllUsers = async () => {
    const adminData = localStorage.getItem("admin")
    if (!adminData) {
      router.push("/admin/login")
      return
    }
    const admin = JSON.parse(adminData)
    const resp = await fetch("/api/admin/export-users", {
      method: "POST",
      headers: { "Content-Type": "text/csv", "X-Requested-With": "fetch" },
      body: JSON.stringify({ adminEmail: admin.email })
    })
    if (!resp.ok) {
      setError("Failed to export users")
      return
    }
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `all-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-slate-900 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-slate-800">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Register Students</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Register all students from CSV files and download credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">1. Click "Register Students" to process all CSV files</p>
            <p className="text-sm">2. System generates unique passwords for each student</p>
            <p className="text-sm">3. Download CSV and share credentials with students</p>
            <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded mt-4">
              ⚠️ Students already registered will be skipped
            </p>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button onClick={handleRegister} disabled={loading} className="gap-2">
            <UserPlus className="h-4 w-4" />
            {loading ? "Registering..." : "Register Students from CSV"}
          </Button>
        </div>

        {/* Statistics */}
        {stats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Registration Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Students</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <p className="text-3xl font-bold text-green-600">{stats.registered}</p>
                  <p className="text-sm text-gray-600">Newly Registered</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded">
                  <p className="text-3xl font-bold text-yellow-600">{stats.alreadyRegistered}</p>
                  <p className="text-sm text-gray-600">Already Registered</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded">
                  <p className="text-3xl font-bold text-red-600">{stats.errors}</p>
                  <p className="text-sm text-gray-600">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student List */}
        {students.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle>Registered Students ({students.length})</CardTitle>
                  <CardDescription>Credentials ready to send</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button onClick={downloadCSV} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download CSV
                  </Button>
                  <Button onClick={downloadAllUsers} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download All Users CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead>Courses</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.rollNo}>
                        <TableCell className="font-mono font-bold">{student.rollNo}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="text-sm">{student.email}</TableCell>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{student.password}</code>
                        </TableCell>
                        <TableCell className="text-xs">{student.courses}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

