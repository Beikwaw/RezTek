"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import TenantDashboard from "@/components/tenant/dashboard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user, tenant, loading, error } = useAuth()
  const router = useRouter()
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/tenant/login")
    }
  }, [user, loading, router])

  // Handle errors from auth context
  useEffect(() => {
    if (error) {
      setLocalError(error)
    }
  }, [error])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (localError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {localError}
              <div className="mt-4">
                <p>This could be due to Firebase security rules or configuration issues.</p>
              </div>
            </AlertDescription>
          </Alert>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => router.push("/tenant/login")} variant="outline">
              Back to Login
            </Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !tenant) {
    return null // Will redirect in useEffect
  }

  return <TenantDashboard />
}
