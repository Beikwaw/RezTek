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
import { generateTenantCode } from "@/lib/utils"

export default function CreateTestAccount() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [accountDetails, setAccountDetails] = useState<{
    email: string
    password: string
    tenantCode: string
  } | null>(null)

  const createTestTenant = async () => {
    setIsCreating(true)
    setError(null)
    setSuccess(false)

    try {
      // Generate test account details
      const timestamp = Date.now()
      const email = `test-tenant-${timestamp}@example.com`
      const password = `Test123!${timestamp.toString().slice(-4)}`

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Generate tenant data
      const name = "Test"
      const surname = "Tenant"
      const tenantCode = generateTenantCode(name, "A101")

      // Create tenant document
      const tenantData = {
        id: user.uid,
        name,
        surname,
        email,
        contactNumber: "0712345678",
        roomNumber: "A101",
        residence: "My Domain Observatory",
        tenantCode,
        createdAt: new Date(),
      }

      await setDoc(doc(db, "tenants", user.uid), tenantData)

      // Show success message with account details
      setAccountDetails({
        email,
        password,
        tenantCode,
      })
      setSuccess(true)
    } catch (error: any) {
      console.error("Error creating test account:", error)
      setError(error.message || "Failed to create test account")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Test Tenant Account</CardTitle>
          <CardDescription>
            This page creates a test tenant account with random credentials for testing purposes
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
                <p className="font-medium mb-2">Test account created successfully!</p>
                <div className="bg-green-100 p-3 rounded-md font-mono text-sm">
                  <p>Email: {accountDetails.email}</p>
                  <p>Password: {accountDetails.password}</p>
                  <p>Tenant Code: {accountDetails.tenantCode}</p>
                </div>
                <p className="mt-2 text-xs">Please save these credentials as they won't be shown again.</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <p>
              This will create a new tenant account with random credentials that you can use for testing the
              application.
            </p>
            <p>The account will be created with the following details:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Random email address</li>
              <li>Random secure password</li>
              <li>Room: A101</li>
              <li>Residence: My Domain Observatory</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button onClick={createTestTenant} disabled={isCreating}>
            {isCreating ? "Creating Account..." : "Create Test Account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
