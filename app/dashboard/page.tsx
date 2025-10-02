"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, User, KeyRound, MessageSquare } from "lucide-react"
import Link from "next/link"

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
  const [unreadCount, setUnreadCount] = useState(0)
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
    
    // Fetch unread count
    fetchUnreadCount(studentData.rollNo)
    
    // Poll for new responses every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount(studentData.rollNo)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [router])

  const fetchMarks = async (rollNo: string) => {
    try {
      const response = await fetch(`/api/student/marks?rollNo=${rollNo}`)
      const data = await response.json()

      if (data.courses) {
        setCoursesData(data.courses)
      }
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async (rollNo: string) => {
    try {
      const response = await fetch(`/api/queries/student?rollNo=${rollNo}`)
      const data = await response.json()

      if (data.success && data.queries) {
        const unread = data.queries.filter((q: any) => q.hasUnreadResponse === true).length
        setUnreadCount(unread)
      }
    } catch (error) {
      // Silent fail - not critical
    }
  }

  const handleLogout = async () => {
    if (student) {
      // Log logout activity
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rollNo: student.rollNo,
            name: student.name,
            email: (student as any).email,
          }),
        })
      } catch (error) {
        // Silent fail - not critical
      }
    }
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
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Student Portal</h1>
                <p className="text-xs sm:text-sm text-gray-600">{student?.name}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto">
              <Link href="/queries" className="flex-1 sm:flex-none">
                <Button variant="outline" className="gap-1 sm:gap-2 bg-transparent relative w-full sm:w-auto text-xs sm:text-sm">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                  Queries
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordChange(!showPasswordChange)} 
                className="gap-1 sm:gap-2 bg-transparent flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <KeyRound className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Change Password</span>
                <span className="sm:hidden">Password</span>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-1 sm:gap-2 bg-transparent flex-1 sm:flex-none text-xs sm:text-sm">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
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

        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Marks</h2>
          <p className="text-sm sm:text-base text-gray-600">Roll Number: {student?.rollNo}</p>
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
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Assessment</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(courseData.marks).map(([assessment, score], markIndex) => (
                        <TableRow key={markIndex}>
                          <TableCell className="font-medium text-xs sm:text-sm">{assessment}</TableCell>
                          <TableCell className="text-right text-xs sm:text-sm">
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
