"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Search, Filter } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { MaintenanceRequest, RequestStatus, Tenant, UrgencyLevel } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ExpandableImage } from "@/components/ui/expandable-image"

interface RequestManagementProps {
  requests: MaintenanceRequest[]
  tenants: Tenant[]
  loading: boolean
}

export function RequestManagement({ requests, tenants, loading }: RequestManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">("All")
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | "All">("All")
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
    setError("")
    setSuccess(false)
    setUpdatingStatus(requestId)

    try {
      await updateDoc(doc(db, "maintenanceRequests", requestId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      })

      setSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error updating request status:", error)
      setError("Failed to update request status. Please try again.")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case "Submitted":
        return "bg-blue-100 text-blue-800"
      case "Application Viewed":
        return "bg-yellow-100 text-yellow-800"
      case "Pending":
        return "bg-orange-100 text-orange-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case "Low":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "High":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filter and search requests
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.waitingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tenant?.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tenant?.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "All" || request.status === statusFilter
    const matchesUrgency = urgencyFilter === "All" || request.urgencyLevel === urgencyFilter

    return matchesSearch && matchesStatus && matchesUrgency
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Request Management</CardTitle>
          <CardDescription>Loading maintenance requests...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Management</CardTitle>
        <CardDescription>View and manage all maintenance requests</CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Request status updated successfully!</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by ID, description, or tenant..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RequestStatus | "All")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Application Viewed">Application Viewed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={urgencyFilter} onValueChange={(value) => setUrgencyFilter(value as UrgencyLevel | "All")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Urgencies</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No maintenance requests found matching your filters.</div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border rounded-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Request ID:</span>
                      <span className="ml-2 font-mono">{request.waitingNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getUrgencyColor(request.urgencyLevel)}>{request.urgencyLevel}</Badge>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>
                  </div>

                  <div className="p-4 grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Tenant:</span>
                        <span className="ml-2">
                          {request.tenant ? `${request.tenant.name} ${request.tenant.surname}` : "Unknown Tenant"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Room:</span>
                        <span className="ml-2">{request.tenant?.roomNumber || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Residence:</span>
                        <span className="ml-2">{request.tenant?.residence || "Unknown"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Location:</span>
                        <span className="ml-2">{request.issueLocation}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Submitted:</span>
                        <span className="ml-2">{formatDate(request.submittedAt)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                        <span className="ml-2">{formatDate(request.updatedAt)}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Description:</span>
                      <p className="mt-1 text-gray-700">{request.description}</p>
                    </div>

                    {request.imageUrl && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Image:</span>
                        <div className="mt-2">
                          <ExpandableImage
                            src={request.imageUrl}
                            alt="Issue"
                            width={400}
                            height={300}
                            className="max-h-40 w-auto rounded-md border"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Update Status:</span>
                      <Select
                        defaultValue={request.status}
                        onValueChange={(value) => handleStatusChange(request.id, value as RequestStatus)}
                        disabled={updatingStatus === request.id}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Submitted">Submitted</SelectItem>
                          <SelectItem value="Application Viewed">Application Viewed</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>

                      {updatingStatus === request.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900"></div>
                      )}
                    </div>

                    {request.tenant && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Contact Tenant:</span>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `mailto:${request.tenant?.email}`}
                          >
                            Send Email
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `tel:${request.tenant?.contactNumber}`}
                          >
                            Call Tenant
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
