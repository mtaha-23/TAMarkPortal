"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, Shield, Activity, MessageSquare, Search, UserPlus } from "lucide-react"
import { QueryStatus } from "@/lib/admin"
import Link from "next/link"

interface ActivityLog {
  id: string
  rollNo: string
  name: string
  email: string
  activityType: string
  timestamp: string
  userAgent: string
}

interface Query {
  id: string
  rollNo: string
  name: string
  email: string
  courses?: string
  subject: string
  message: string
  status: string
  createdAt: string
  updatedAt: string
  adminResponse: string | null
  adminComment: string | null
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<{ email: string } | null>(null)
  const [activeTab, setActiveTab] = useState<"logs" | "queries">("logs")
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [adminResponse, setAdminResponse] = useState("")
  const [adminComment, setAdminComment] = useState("")
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const adminData = localStorage.getItem("admin")
    if (!adminData) {
      router.push("/admin/login")
      return
    }

    const parsedAdmin = JSON.parse(adminData)
    setAdmin(parsedAdmin)

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [logsRes, queriesRes] = await Promise.all([
        fetch("/api/admin/activity-logs"),
        fetch("/api/admin/queries")
      ])

      const logsData = await logsRes.json()
      const queriesData = await queriesRes.json()

      if (logsData.success) setLogs(logsData.logs)
      if (queriesData.success) setQueries(queriesData.queries)
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin")
    router.push("/admin/login")
  }

  const handleUpdateQuery = async (queryId: string, status: string) => {
    setUpdating(true)
    try {
      const response = await fetch("/api/admin/queries/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryId,
          status,
          adminResponse: adminResponse || null,
          adminComment: adminComment || null,
        }),
      })

      if (response.ok) {
        await fetchData()
        setSelectedQuery(null)
        setAdminResponse("")
        setAdminComment("")
      }
    } catch (error) {
      // Silent fail
    } finally {
      setUpdating(false)
    }
  }

  const filteredLogs = logs.filter(log =>
    log.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.activityType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get unique courses for filter dropdown
  const uniqueCourses = Array.from(new Set(queries.map(q => q.courses).filter(Boolean)))

  const filteredQueries = queries.filter(query => {
    // Search filter
    const matchesSearch = 
      query.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Status filter
    const matchesStatus = statusFilter === "all" || query.status === statusFilter
    
    // Course filter
    const matchesCourse = courseFilter === "all" || query.courses?.includes(courseFilter)
    
    return matchesSearch && matchesStatus && matchesCourse
  })

  // Count queries by status
  const openCount = queries.filter(q => q.status === QueryStatus.OPEN).length
  const inProgressCount = queries.filter(q => q.status === QueryStatus.IN_PROGRESS).length
  const closedCount = queries.filter(q => q.status === QueryStatus.CLOSED).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <p className="text-lg">Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-slate-900 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">TA Dashboard</h1>
                <p className="text-xs sm:text-sm text-slate-300 truncate max-w-[200px] sm:max-w-none">{admin?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-1 sm:gap-2 border-slate-600 text-white hover:bg-slate-800 text-xs sm:text-sm">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button
            variant={activeTab === "logs" ? "default" : "outline"}
            onClick={() => setActiveTab("logs")}
            className="gap-1 sm:gap-2 w-full sm:w-auto text-sm"
          >
            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Activity Logs</span>
            <span className="sm:hidden">Logs</span>
          </Button>
          <Button
            variant={activeTab === "queries" ? "default" : "outline"}
            onClick={() => setActiveTab("queries")}
            className="gap-1 sm:gap-2 w-full sm:w-auto text-sm"
          >
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Student Queries ({queries.filter(q => q.status === QueryStatus.OPEN).length} open)</span>
            <span className="sm:hidden">Queries ({queries.filter(q => q.status === QueryStatus.OPEN).length})</span>
          </Button>
          <Link href="/admin/register-students" className="w-full sm:w-auto">
            <Button variant="outline" className="gap-1 sm:gap-2 w-full text-sm">
              <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
              Register Students
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
            <div className="relative flex-1 min-w-full sm:min-w-[250px]">
              <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={activeTab === "logs" ? "Search logs..." : "Search queries..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>

            {activeTab === "queries" && (
              <>
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 sm:px-4 py-2 border rounded-md bg-white w-full sm:w-auto sm:min-w-[150px] text-sm"
                >
                  <option value="all">All Status ({queries.length})</option>
                  <option value={QueryStatus.OPEN}>Open ({openCount})</option>
                  <option value={QueryStatus.IN_PROGRESS}>In Progress ({inProgressCount})</option>
                  <option value={QueryStatus.CLOSED}>Closed ({closedCount})</option>
                </select>

                {/* Course Filter */}
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="px-3 sm:px-4 py-2 border rounded-md bg-white w-full sm:w-auto sm:min-w-[200px] text-sm"
                >
                  <option value="all">All Courses</option>
                  {uniqueCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>

                {/* Clear Filters Button */}
                {(statusFilter !== "all" || courseFilter !== "all" || searchTerm) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter("all")
                      setCourseFilter("all")
                      setSearchTerm("")
                    }}
                    className="w-full sm:w-auto text-sm"
                  >
                    Clear Filters
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Filter Summary */}
          {activeTab === "queries" && filteredQueries.length !== queries.length && (
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Showing {filteredQueries.length} of {queries.length} queries
            </p>
          )}
        </div>

        {/* Activity Logs Tab */}
        {activeTab === "logs" && (
          <Card>
            <CardHeader>
              <CardTitle>Student Activity Logs</CardTitle>
              <CardDescription>Monitor all student login, logout, and portal activity</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Time</TableHead>
                    <TableHead className="text-xs sm:text-sm">Roll No</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Name</TableHead>
                    <TableHead className="text-xs sm:text-sm">Activity</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">User Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs sm:text-sm whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString()}<br className="sm:hidden"/>
                        <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-medium">{log.rollNo}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell">{log.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                          log.activityType === "login" ? "bg-green-100 text-green-800" :
                          log.activityType === "logout" ? "bg-gray-100 text-gray-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {log.activityType}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 max-w-xs truncate hidden lg:table-cell">
                        {log.userAgent}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Queries Tab */}
        {activeTab === "queries" && (
          <div className="space-y-3 sm:space-y-6">
            {filteredQueries.map((query) => (
              <Card key={query.id} className={selectedQuery?.id === query.id ? "border-blue-500" : ""}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-0">
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 sm:px-3 py-1 bg-slate-800 text-white rounded-md font-mono font-bold text-xs sm:text-sm">
                          {query.rollNo}
                        </span>
                        <span className="text-gray-600 font-medium text-sm sm:text-base">{query.name}</span>
                      </div>
                      <CardTitle className="text-base sm:text-lg">{query.subject}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {query.courses && (
                          <span className="inline-block mr-2 text-blue-600 font-medium">
                            📚 {query.courses}
                          </span>
                        )}
                        <span className="block sm:inline">• {new Date(query.createdAt).toLocaleString()}</span>
                      </CardDescription>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold self-start ${
                      query.status === QueryStatus.OPEN ? "bg-yellow-100 text-yellow-800" :
                      query.status === QueryStatus.IN_PROGRESS ? "bg-blue-100 text-blue-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {query.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <strong className="text-sm">Student Message:</strong>
                    <p className="mt-1 text-sm text-gray-700">{query.message}</p>
                  </div>

                  {query.adminResponse && (
                    <div className="bg-blue-50 p-3 rounded">
                      <strong className="text-sm text-blue-900">TA Response:</strong>
                      <p className="mt-1 text-sm text-blue-800">{query.adminResponse}</p>
                    </div>
                  )}

                  {query.adminComment && (
                    <div className="bg-gray-50 p-3 rounded">
                      <strong className="text-sm text-gray-900">Internal TA Comment:</strong>
                      <p className="mt-1 text-sm text-gray-700">{query.adminComment}</p>
                    </div>
                  )}

                  {selectedQuery?.id === query.id ? (
                    <div className="space-y-4 border-t pt-4">
                      <div>
                        <Label htmlFor="response">Response to Student</Label>
                        <Input
                          id="response"
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          placeholder="Enter your response..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="comment">Internal TA Comment (not visible to student)</Label>
                        <Input
                          id="comment"
                          value={adminComment}
                          onChange={(e) => setAdminComment(e.target.value)}
                          placeholder="Add internal TA notes..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => handleUpdateQuery(query.id, QueryStatus.IN_PROGRESS)}
                          disabled={updating}
                          variant="outline"
                          className="w-full sm:w-auto text-sm"
                        >
                          Mark In Progress
                        </Button>
                        <Button
                          onClick={() => handleUpdateQuery(query.id, QueryStatus.CLOSED)}
                          disabled={updating}
                          className="w-full sm:w-auto text-sm"
                        >
                          {updating ? "Updating..." : "Close Query"}
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedQuery(null)
                            setAdminResponse("")
                            setAdminComment("")
                          }}
                          variant="ghost"
                          className="w-full sm:w-auto text-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedQuery(query)
                        setAdminResponse(query.adminResponse || "")
                        setAdminComment(query.adminComment || "")
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto text-sm"
                    >
                      Respond to Query
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredQueries.length === 0 && (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-600">No queries found.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

