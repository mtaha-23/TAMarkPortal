"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignupPage() {
  const router = useRouter()
  const [rollNo, setRollNo] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [signupDisabled] = useState(true) // Signup disabled - TA registers students

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNo, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store user info in localStorage
        localStorage.setItem("student", JSON.stringify(data.student))
        router.push("/dashboard")
      } else {
        setError(data.error || "Signup failed")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Student Registration</CardTitle>
          <CardDescription className="text-center">
            {signupDisabled 
              ? "Registration is managed by your teaching assistant"
              : "Sign up with your roll number to view your marks"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signupDisabled ? (
            <div className="space-y-4">
              <Alert className="border-blue-500 bg-blue-50">
                <AlertDescription className="text-blue-900">
                  <strong>Registration Process:</strong>
                  <ol className="mt-2 ml-4 list-decimal space-y-1">
                    <li>Your teaching assistant will create your account</li>
                    <li>You'll receive login credentials via email</li>
                    <li>Use your roll number and the provided password to login</li>
                    <li>Change your password after first login</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Already have credentials?
                </p>
                <a href="/login">
                  <Button className="w-full">
                    Go to Login
                  </Button>
                </a>
                <p className="text-xs text-gray-500 mt-4">
                  Haven't received your credentials? Contact your teaching assistant.
                </p>
              </div>
            </div>
          ) : (
            // Original signup form (kept for future use if needed)
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input
                  id="rollNo"
                  type="text"
                  placeholder="e.g., 22F-3277"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <a href="/login" className="text-blue-600 hover:underline">
                  Login
                </a>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

