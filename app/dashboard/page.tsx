"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, User, KeyRound } from "lucide-react"

interface CourseMarks {
  courseName: string
  name: string
  marks: Record<string, string>
}

export default function DashboardPage() {
  const [student, setStudent] = useState<{ rollNo: string; name: string } | null>(null)
  const [coursesData, setCoursesData] = useState<CourseMarks[]>([])
  const [loading, setLoading] = useState(true)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const sessionData = localStorage.getItem("student")
    if (!sessionData) {
      router.push("/login")
      return
    }

    const studentData = JSON.parse(sessionData)
    setStudent(studentData)

    // Fetch marks
    fetchMarks(studentData.rollNo)
  }, [router])

  const fetchMarks = async (rollNo: string) => {
    try {
      const response = await fetch(`/api/student/marks?rollNo=${rollNo}`)
      const data = await response.json()

      if (data.courses) {
        setCoursesData(data.courses)
      }
    } catch (error) {
      console.error("[v0] Error fetching marks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("student")
    router.push("/login")
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters")
      return
    }

    if (!student) return

    setChangingPassword(true)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNo: student.rollNo,
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordSuccess("Password changed successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => {
          setShowPasswordChange(false)
          setPasswordSuccess("")
        }, 2000)
      } else {
        setPasswordError(data.error || "Failed to change password")
      }
    } catch (err) {
      setPasswordError("An error occurred. Please try again.")
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-lg">Loading your marks...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-sm text-gray-600">{student?.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordChange(!showPasswordChange)} 
                className="gap-2 bg-transparent"
              >
                <KeyRound className="h-4 w-4" />
                Change Password
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Change Password Card */}
        {showPasswordChange && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={changingPassword}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={changingPassword}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={changingPassword}
                  />
                </div>

                {passwordError && (
                  <Alert variant="destructive">
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                {passwordSuccess && (
                  <Alert className="border-green-500 bg-green-50">
                    <AlertDescription className="text-green-700">{passwordSuccess}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={changingPassword}>
                    {changingPassword ? "Changing..." : "Change Password"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowPasswordChange(false)
                      setPasswordError("")
                      setPasswordSuccess("")
                      setCurrentPassword("")
                      setNewPassword("")
                      setConfirmPassword("")
                    }}
                    disabled={changingPassword}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Marks</h2>
          <p className="text-gray-600">Roll Number: {student?.rollNo}</p>
        </div>

        {coursesData.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-600">No marks available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {coursesData.map((courseData, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{courseData.courseName}</CardTitle>
                  <CardDescription>Assessment scores and grades</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assessment</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(courseData.marks).map(([assessment, score], markIndex) => (
                        <TableRow key={markIndex}>
                          <TableCell className="font-medium">{assessment}</TableCell>
                          <TableCell className="text-right">
                            {score === "" || score === "Not Graded" ? (
                              <span className="text-gray-400 italic">Not Graded</span>
                            ) : (
                              <span className="font-semibold text-blue-600">{score}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
