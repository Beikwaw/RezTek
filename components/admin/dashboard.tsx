"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, BarChart } from "lucide-react"
import type { MaintenanceRequest, Tenant, Residence, Feedback } from "@/lib/types"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore"
import { RequestManagement } from "@/components/admin/request-management"
import { TenantManagement } from "@/components/admin/tenant-management"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"
import { StockManagement } from "@/components/admin/stock-management"
import { ReportGenerator } from "@/components/admin/report-generator"
import { FeedbackViewer } from "@/components/admin/feedback-viewer"
import { StockPDFDownloader } from "@/components/admin/stock-pdf-downloader"
import { FeedbackPDFDownloader } from "@/components/admin/feedback-pdf-downloader"

export default function AdminDashboard() {
  const { admin, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResidence, setSelectedResidence] = useState<Residence | "All">("All")

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/admin/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  useEffect(() => {
    // Fetch all tenants
    const fetchTenants = async () => {
      try {
        const tenantsSnapshot = await getDocs(collection(db, "tenants"))
        const tenantsData: Tenant[] = []

        tenantsSnapshot.forEach((doc) => {
          const data = doc.data()
          tenantsData.push({
            id: doc.id,
            name: data.name,
            surname: data.surname,
            email: data.email,
            contactNumber: data.contactNumber,
            roomNumber: data.roomNumber,
            residence: data.residence,
            tenantCode: data.tenantCode,
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
          })
        })

        setTenants(tenantsData)
      } catch (error) {
        console.error("Error fetching tenants:", error)
      }
    }

    fetchTenants()

    // Set up real-time listener for maintenance requests
    const q = query(collection(db, "maintenanceRequests"), orderBy("submittedAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const requestData: MaintenanceRequest[] = []

        for (const doc of snapshot.docs) {
          const data = doc.data()

          // Get tenant details for each request
          let tenant: Tenant | undefined

          try {
            const tenantDoc = tenants.find((t) => t.id === data.tenantId)
            if (tenantDoc) {
              tenant = tenantDoc
            }
          } catch (error) {
            console.error("Error fetching tenant for request:", error)
          }

          requestData.push({
            id: doc.id,
            waitingNumber: data.waitingNumber,
            tenantId: data.tenantId,
            tenant,
            issueLocation: data.issueLocation,
            urgencyLevel: data.urgencyLevel,
            description: data.description,
            imageUrl: data.imageUrl,
            status: data.status,
            submittedAt: data.submittedAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            hasFeedback: data.hasFeedback || false,
          })
        }

        setRequests(requestData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching requests:", err)
        setLoading(false)
      },
    )

    // Fetch feedback data
    const fetchFeedback = async () => {
      try {
        const feedbackSnapshot = await getDocs(collection(db, "feedback"))
        const feedbackData: Feedback[] = []

        feedbackSnapshot.forEach((doc) => {
          const data = doc.data()
          feedbackData.push({
            id: doc.id,
            requestId: data.requestId,
            rating: data.rating,
            description: data.description,
            submittedAt: data.submittedAt?.toDate() || new Date(),
          })
        })

        setFeedback(feedbackData)
      } catch (error) {
        console.error("Error fetching feedback:", error)
      }
    }

    fetchFeedback()

    return () => unsubscribe()
  }, [tenants])

  const filteredRequests =
    selectedResidence === "All" ? requests : requests.filter((req) => req.tenant?.residence === selectedResidence)

  const filteredTenants =
    selectedResidence === "All" ? tenants : tenants.filter((tenant) => tenant.residence === selectedResidence)

  if (!admin) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">RezTek Admin Portal</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Admin: <span className="font-medium">{admin.username}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-500">Manage maintenance requests and tenant information</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter by Residence:</span>
            <select
              value={selectedResidence}
              onChange={(e) => setSelectedResidence(e.target.value as Residence | "All")}
              className="rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-sm"
            >
              <option value="All">All Residences</option>
              <option value="My Domain Salt River">My Domain Salt River</option>
              <option value="My Domain Observatory">My Domain Observatory</option>
            </select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Requests</CardTitle>
                  <CardDescription>All maintenance requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{filteredRequests.length}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedResidence === "All" ? "Across all residences" : `At ${selectedResidence}`}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pending Requests</CardTitle>
                  <CardDescription>Requests awaiting completion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {filteredRequests.filter((r) => r.status !== "Completed").length}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Need attention</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Registered Tenants</CardTitle>
                  <CardDescription>Total tenant accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{filteredTenants.length}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedResidence === "All" ? "Across all residences" : `At ${selectedResidence}`}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Analytics Dashboard
                  </CardTitle>
                  <CardDescription>Maintenance request statistics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsDashboard requests={filteredRequests} selectedResidence={selectedResidence} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <RequestManagement requests={filteredRequests} tenants={tenants} loading={loading} />
          </TabsContent>

          <TabsContent value="tenants">
            <TenantManagement tenants={filteredTenants} requests={requests} />
          </TabsContent>

          <TabsContent value="stock">
            <div className="space-y-6">
              <div className="flex justify-end">
                <StockPDFDownloader />
              </div>
              <StockManagement selectedResidence={selectedResidence} />
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <ReportGenerator requests={requests} />
          </TabsContent>

          <TabsContent value="feedback">
            <div className="space-y-6">
              <div className="flex justify-end">
                <FeedbackPDFDownloader />
              </div>
              <FeedbackViewer feedback={feedback} requests={requests} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
