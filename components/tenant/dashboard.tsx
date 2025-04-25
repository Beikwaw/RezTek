"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Plus, History, User, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import MaintenanceRequestForm from "@/components/tenant/maintenance-request-form"
import RequestHistory from "@/components/tenant/request-history"
import TenantProfile from "@/components/tenant/tenant-profile"

export default function TenantDashboard() {
  const { tenant, signOut, error } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/tenant/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Unable to load tenant information. Please try logging in again.</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.push("/tenant/login")}>Back to Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">RezTek Portal</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Welcome, <span className="font-medium">{tenant.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tenant Information</CardTitle>
                  <CardDescription>Your registered details</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Name:</dt>
                      <dd>
                        {tenant.name} {tenant.surname}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Room:</dt>
                      <dd>{tenant.roomNumber}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Residence:</dt>
                      <dd>{tenant.residence}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Tenant Code:</dt>
                      <dd className="font-mono">{tenant.tenantCode}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>What would you like to do?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" onClick={() => setActiveTab("requests")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Maintenance Request
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("requests")}>
                    <History className="mr-2 h-4 w-4" />
                    View Request History
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Update Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Important Contacts</CardTitle>
                <CardDescription>Keep these numbers handy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium">My Domain Salt River</h3>
                      <p className="text-sm text-gray-500">Front Desk: 021 123 4567</p>
                      <p className="text-sm text-gray-500">Emergency: 021 123 4568</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <h3 className="font-medium">My Domain Observatory</h3>
                      <p className="text-sm text-gray-500">
                        <a href="tel:0214045208" className="hover:underline">Emergency Ambulance: 021 404 5208</a>
                      </p>
                      <p className="text-sm text-gray-500">
                        <a href="tel:0716790208" className="hover:underline">Emergency: 071 679 0208</a>
                      </p>
                      <p className="text-sm text-gray-500">
                        <a href="mailto:obs@mydomainliving.co.za" className="hover:underline">Sleepover Request: obs@mydomainliving.co.za</a>
                      </p>
                      <p className="text-sm text-gray-500">
                        <a href="mailto:carmen@swish.co.za" className="hover:underline">Finance: carmen@swish.co.za</a>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <div className="space-y-6">
              <MaintenanceRequestForm />
              <RequestHistory />
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <TenantProfile />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
