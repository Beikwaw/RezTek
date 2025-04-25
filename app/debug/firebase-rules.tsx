// Create a new debug page to help diagnose Firebase rules issues
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { auth, db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"

export default function FirebaseRulesDebugPage() {
  const [testResults, setTestResults] = useState<{
    auth: "pending" | "success" | "error"
    tenantRead: "pending" | "success" | "error"
    adminRead: "pending" | "success" | "error"
    write: "pending" | "success" | "error"
  }>({
    auth: "pending",
    tenantRead: "pending",
    adminRead: "pending",
    write: "pending",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [testUser, setTestUser] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)

  const runTests = async () => {
    setIsTesting(true)
    setErrors({})
    setTestResults({
      auth: "pending",
      tenantRead: "pending",
      adminRead: "pending",
      write: "pending",
    })

    // Test authentication
    try {
      const timestamp = Date.now()
      const email = `test-${timestamp}@example.com`
      const password = `Test123!${timestamp}`

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      setTestUser(userCredential.user)
      setTestResults((prev) => ({ ...prev, auth: "success" }))
    } catch (error: any) {
      console.error("Auth test failed:", error)
      setTestResults((prev) => ({ ...prev, auth: "error" }))
      setErrors((prev) => ({ ...prev, auth: error.message }))
    }

    // Test tenant read
    try {
      const tenantsSnapshot = await getDocs(collection(db, "tenants"))
      setTestResults((prev) => ({ ...prev, tenantRead: "success" }))
    } catch (error: any) {
      console.error("Tenant read test failed:", error)
      setTestResults((prev) => ({ ...prev, tenantRead: "error" }))
      setErrors((prev) => ({ ...prev, tenantRead: error.message }))
    }

    // Test admin read
    try {
      const adminsSnapshot = await getDocs(collection(db, "admins"))
      setTestResults((prev) => ({ ...prev, adminRead: "success" }))
    } catch (error: any) {
      console.error("Admin read test failed:", error)
      setTestResults((prev) => ({ ...prev, adminRead: "error" }))
      setErrors((prev) => ({ ...prev, adminRead: error.message }))
    }

    setIsTesting(false)
  }

  const getStatusBadge = (status: "pending" | "success" | "error") => {
    if (status === "pending") return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">Pending</span>
    if (status === "success") return <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Success</span>
    return <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Failed</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Firebase Rules Debug</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Firebase Security Rules Test</CardTitle>
            <CardDescription>Test your Firebase security rules to diagnose permission issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Authentication:</span>
                {getStatusBadge(testResults.auth)}
              </div>
              {errors.auth && <p className="text-sm text-red-600">{errors.auth}</p>}

              <div className="flex justify-between items-center">
                <span>Tenant Collection Read:</span>
                {getStatusBadge(testResults.tenantRead)}
              </div>
              {errors.tenantRead && <p className="text-sm text-red-600">{errors.tenantRead}</p>}

              <div className="flex justify-between items-center">
                <span>Admin Collection Read:</span>
                {getStatusBadge(testResults.adminRead)}
              </div>
              {errors.adminRead && <p className="text-sm text-red-600">{errors.adminRead}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={runTests} disabled={isTesting}>
              {isTesting ? "Running Tests..." : "Run Tests"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Firebase Rules</CardTitle>
            <CardDescription>Copy these rules to your Firebase console</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read their own tenant document
    match /tenants/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read and write their own maintenance requests
    match /maintenanceRequests/{requestId} {
      allow read: if request.auth != null && 
                   (resource.data.tenantId == request.auth.uid || 
                    get(/databases/$(database)/documents/admins/$(request.auth.uid)).data != null);
      allow write: if request.auth != null && 
                    (request.resource.data.tenantId == request.auth.uid || 
                     get(/databases/$(database)/documents/admins/$(request.auth.uid)).data != null);
    }
    
    // Allow admins to read all documents
    match /{document=**} {
      allow read, write: if request.auth != null && 
                           get(/databases/$(database)/documents/admins/$(request.auth.uid)).data != null;
    }
  }
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
