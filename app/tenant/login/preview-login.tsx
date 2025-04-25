"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function PreviewLogin() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createAndLoginPreviewUser = async () => {
    setIsCreating(true)
    setError(null)
    setSuccess(false)

    try {
      // Generate preview account details
      const timestamp = Date.now()
      const email = `preview-${timestamp}@example.com`
      const password = `Preview123!`

      try {
        // Try to create a new user
        await createUserWithEmailAndPassword(auth, email, password)
        console.log("Preview user created successfully")
      } catch (createError: any) {
        // If user already exists or other error, try to sign in directly
        console.log("Could not create preview user, trying to sign in:", createError)
      }

      // Sign in with the preview account
      await signInWithEmailAndPassword(auth, email, password)

      setSuccess(true)

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/tenant/dashboard")
      }, 1000)
    } catch (error: any) {
      console.error("Preview login error:", error)
      setError(error.message || "Failed to create preview session")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Preview Login</CardTitle>
          <CardDescription>Access the tenant dashboard in preview mode</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <p>Preview session created successfully! Redirecting to dashboard...</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <p>
              This will create a temporary preview session that allows you to explore the tenant dashboard without
              needing to set up Firebase security rules.
            </p>
            <p>Note: In preview mode, some features will be simulated and data will not be saved to the database.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/tenant/login")}>
            Back to Login
          </Button>
          <Button onClick={createAndLoginPreviewUser} disabled={isCreating}>
            {isCreating ? "Creating Preview..." : "Enter Preview Mode"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
