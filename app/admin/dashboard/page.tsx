"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, Shield, Activity, MessageSquare, Search } from "lucide-react"
import { QueryStatus } from "@/lib/admin"

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
      console.error("Error fetching data:", error)
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
      console.error("Error updating query:", error)
    } finally {
      setUpdating(false)
    }
  }

  const filteredLogs = logs.filter(log =>
    log.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.activityType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredQueries = queries.filter(query =>
    query.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold text-white">TA Dashboard</h1>
                <p className="text-sm text-slate-300">{admin?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 border-slate-600 text-white hover:bg-slate-800">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "logs" ? "default" : "outline"}
            onClick={() => setActiveTab("logs")}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            Activity Logs
          </Button>
          <Button
            variant={activeTab === "queries" ? "default" : "outline"}
            onClick={() => setActiveTab("queries")}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Student Queries ({queries.filter(q => q.status === QueryStatus.OPEN).length} open)
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={activeTab === "logs" ? "Search logs..." : "Search queries..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Activity Logs Tab */}
        {activeTab === "logs" && (
          <Card>
            <CardHeader>
              <CardTitle>Student Activity Logs</CardTitle>
              <CardDescription>Monitor all student login, logout, and portal activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>User Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.rollNo}</TableCell>
                      <TableCell>{log.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          log.activityType === "login" ? "bg-green-100 text-green-800" :
                          log.activityType === "logout" ? "bg-gray-100 text-gray-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {log.activityType}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 max-w-xs truncate">
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
          <div className="space-y-6">
            {filteredQueries.map((query) => (
              <Card key={query.id} className={selectedQuery?.id === query.id ? "border-blue-500" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{query.subject}</CardTitle>
                      <CardDescription>
                        From: {query.name} ({query.rollNo}) • {new Date(query.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateQuery(query.id, QueryStatus.IN_PROGRESS)}
                          disabled={updating}
                          variant="outline"
                        >
                          Mark In Progress
                        </Button>
                        <Button
                          onClick={() => handleUpdateQuery(query.id, QueryStatus.CLOSED)}
                          disabled={updating}
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

