"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function CreateTestAdminAccount() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [accountDetails, setAccountDetails] = useState<{
    email: string
    password: string
    username: string
  } | null>(null)

  const createTestAdmin = async () => {
    setIsCreating(true)
    setError(null)
    setSuccess(false)

    try {
      // Generate test account details
      const timestamp = Date.now()
      const email = `admin-${timestamp}@reztek.com`
      const password = `Admin123!${timestamp.toString().slice(-4)}`
      const username = `Admin${timestamp.toString().slice(-4)}`

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create admin document
      const adminData = {
        id: user.uid,
        username,
        email,
        role: "administrator",
        createdAt: new Date(),
      }

      await setDoc(doc(db, "admins", user.uid), adminData)

      // Show success message with account details
      setAccountDetails({
        email,
        password,
        username,
      })
      setSuccess(true)
    } catch (error: any) {
      console.error("Error creating test admin account:", error)
      setError(error.message || "Failed to create test admin account")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Test Admin Account</CardTitle>
          <CardDescription>
            This page creates a test admin account with random credentials for testing purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && accountDetails && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Test admin account created successfully!</p>
                <div className="bg-green-100 p-3 rounded-md font-mono text-sm">
                  <p>Email: {accountDetails.email}</p>
                  <p>Password: {accountDetails.password}</p>
                  <p>Username: {accountDetails.username}</p>
                </div>
                <p className="mt-2 text-xs">Please save these credentials as they won't be shown again.</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <p>
              This will create a new admin account with random credentials that you can use for testing the application.
            </p>
            <p>The account will be created with administrator privileges.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button onClick={createTestAdmin} disabled={isCreating}>
            {isCreating ? "Creating Account..." : "Create Test Admin Account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
