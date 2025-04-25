"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { auth } from "@/lib/firebase"

export default function DebugPage() {
  const [firebaseStatus, setFirebaseStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [authMethods, setAuthMethods] = useState<string[]>([])

  useEffect(() => {
    // Check Firebase initialization
    try {
      if (!auth) {
        setFirebaseStatus("error")
        setErrorMessage("Firebase auth object is undefined")
        return
      }

      // Check what methods are available on auth
      const methods = Object.keys(auth).filter((key) => typeof auth[key as keyof typeof auth] === "function")
      setAuthMethods(methods)

      // Check if critical methods exist
      if (!auth.signInWithEmailAndPassword) {
        setFirebaseStatus("error")
        setErrorMessage("Firebase auth is missing signInWithEmailAndPassword method")
        return
      }

      setFirebaseStatus("success")
    } catch (error: any) {
      setFirebaseStatus("error")
      setErrorMessage(error.message || "Unknown error checking Firebase status")
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Firebase Debug Page</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Firebase Status</CardTitle>
            <CardDescription>Checking Firebase initialization status</CardDescription>
          </CardHeader>
          <CardContent>
            {firebaseStatus === "loading" && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900 mr-2"></div>
                <span>Checking Firebase status...</span>
              </div>
            )}

            {firebaseStatus === "success" && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Firebase is properly initialized</AlertDescription>
              </Alert>
            )}

            {firebaseStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage || "Firebase initialization error"}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Firebase Auth Methods</CardTitle>
            <CardDescription>Available methods on the auth object</CardDescription>
          </CardHeader>
          <CardContent>
            {authMethods.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {authMethods.map((method) => (
                  <li key={method}>{method}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No methods found on auth object</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
