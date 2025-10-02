"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { formatRollNumberInput } from "@/lib/utils"

export default function ResetPasswordPage() {
  const [rollNo, setRollNo] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNo }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message || "A password reset link has been sent to your email")
      } else {
        setError(data.error || "Failed to reset password")
      }
    } catch (err) {
      setError("Password reset failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your roll number to receive a new password via email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rollNo">Roll Number</Label>
              <Input
                id="rollNo"
                placeholder="e.g., 22F-3277"
                value={rollNo}
                onChange={(e) => setRollNo(formatRollNumberInput(e.target.value))}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            {message && (
              <div className="text-sm text-green-600 text-center whitespace-pre-line bg-green-50 p-4 rounded-md border border-green-200">
                {message}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Reset Password"}
            </Button>
            <div className="text-center text-sm">
              <Link href="/login" className="text-blue-600 hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
