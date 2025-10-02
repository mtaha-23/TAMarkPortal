"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, MessageSquare, Send } from "lucide-react"
import Link from "next/link"
import { QueryStatus } from "@/lib/admin"

interface Query {
  id: string
  subject: string
  message: string
  courses?: string
  status: string
  createdAt: string
  adminResponse: string | null
  adminComment: string | null
  hasUnreadResponse?: boolean
  responseReadAt?: string | null
}

export default function QueriesPage() {
  const [student, setStudent] = useState<{ rollNo: string; name: string; email?: string } | null>(null)
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const sessionData = localStorage.getItem("student")
    if (!sessionData) {
      router.push("/login")
      return
    }

    const studentData = JSON.parse(sessionData)
    setStudent(studentData)
    fetchQueries(studentData.rollNo)
  }, [router])

  const fetchQueries = async (rollNo: string) => {
    try {
      const response = await fetch(`/api/queries/student?rollNo=${rollNo}`)
      const data = await response.json()

      if (data.success) {
        setQueries(data.queries || [])
        
        // Auto-mark unread responses as read when viewing
        const unreadQueries = (data.queries || []).filter((q: Query) => q.hasUnreadResponse)
        for (const query of unreadQueries) {
          markAsRead(query.id)
        }
      } else {
        setError(data.error || "Failed to load queries")
      }
    } catch (error) {
      setError("Failed to load queries. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (queryId: string) => {
    try {
      await fetch("/api/queries/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryId }),
      })
    } catch (error) {
      // Silent fail - not critical
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Get student's courses from marks API
      const marksResponse = await fetch(`/api/student/marks?rollNo=${student?.rollNo}`)
      const marksData = await marksResponse.json()
      const courses = marksData.courses?.map((c: any) => c.courseName).join(", ") || "Unknown"

      const response = await fetch("/api/queries/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNo: student?.rollNo,
          name: student?.name,
          email: student?.email,
          courses, // Add courses information
          subject,
          message,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Query submitted successfully!")
        setSubject("")
        setMessage("")
        setShowForm(false)
        if (student) fetchQueries(student.rollNo)
      } else {
        setError(data.error || "Failed to submit query")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              <h1 className="text-lg sm:text-xl font-bold">Queries & Support</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Submit New Query Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="mb-4 sm:mb-6 gap-2 w-full sm:w-auto text-sm">
            <Send className="h-4 w-4" />
            Submit New Query
          </Button>
        )}

        {/* New Query Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Submit a New Query</CardTitle>
              <CardDescription>
                Have a question or issue? We're here to help!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    required
                    disabled={submitting}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your query..."
                    required
                    disabled={submitting}
                    className="mt-1 w-full min-h-[120px] px-3 py-2 border rounded-md"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Query"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setSubject("")
                      setMessage("")
                      setError("")
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Existing Queries */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Your Queries</h2>

          {queries.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-600">
                  No queries yet. Click "Submit New Query" to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            queries.map((query) => (
              <Card 
                key={query.id}
                className={query.hasUnreadResponse ? "border-2 border-blue-500 shadow-lg" : ""}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base sm:text-lg">{query.subject}</CardTitle>
                        {query.hasUnreadResponse && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      <CardDescription className="text-xs sm:text-sm mt-1">
                        {query.courses && (
                          <span className="inline-block mr-2 text-blue-600 font-medium">
                            📚 {query.courses}
                          </span>
                        )}
                        <span className="block sm:inline">
                          • Submitted: {new Date(query.createdAt).toLocaleString()}
                        </span>
                      </CardDescription>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold self-start ${
                      query.status === QueryStatus.OPEN ? "bg-yellow-100 text-yellow-800" :
                      query.status === QueryStatus.IN_PROGRESS ? "bg-blue-100 text-blue-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {query.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <strong className="text-sm">Your Message:</strong>
                    <p className="mt-1 text-sm text-gray-700">{query.message}</p>
                  </div>

                  {query.adminResponse && (
                    <div className={`p-3 rounded border ${
                      query.hasUnreadResponse 
                        ? "bg-blue-100 border-blue-400 shadow-md" 
                        : "bg-blue-50 border-blue-200"
                    }`}>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-blue-900">TA Response:</strong>
                        {query.hasUnreadResponse && (
                          <span className="text-xs text-red-600 font-bold">● NEW</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-blue-800">{query.adminResponse}</p>
                    </div>
                  )}

                  {query.status === QueryStatus.CLOSED && !query.adminResponse && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600">
                        This query has been closed by the teaching assistant.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

