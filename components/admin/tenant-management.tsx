"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, User, Mail, Phone } from "lucide-react"
import type { Tenant, MaintenanceRequest, Residence } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface TenantManagementProps {
  tenants: Tenant[]
  requests: MaintenanceRequest[]
}

export function TenantManagement({ tenants, requests }: TenantManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [residenceFilter, setResidenceFilter] = useState<Residence | "All">("All")
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null)

  // Filter and search tenants
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.tenantCode.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesResidence = residenceFilter === "All" || tenant.residence === residenceFilter

    return matchesSearch && matchesResidence
  })

  // Get tenant's requests
  const getTenantRequests = (tenantId: string) => {
    return requests.filter((request) => request.tenantId === tenantId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Management</CardTitle>
        <CardDescription>View and manage tenant information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, email, room number..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={residenceFilter} onValueChange={(value) => setResidenceFilter(value as Residence | "All")}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by residence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Residences</SelectItem>
                  <SelectItem value="My Domain Salt River">My Domain Salt River</SelectItem>
                  <SelectItem value="My Domain Observatory">My Domain Observatory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredTenants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tenants found matching your filters.</div>
          ) : (
            <div className="space-y-4">
              {filteredTenants.map((tenant) => {
                const tenantRequests = getTenantRequests(tenant.id)
                const activeRequests = tenantRequests.filter((r) => r.status !== "Completed").length

                return (
                  <div key={tenant.id} className="border rounded-lg overflow-hidden">
                    <div
                      className="p-4 bg-gray-50 flex flex-wrap justify-between items-center gap-2 cursor-pointer"
                      onClick={() => setExpandedTenant(expandedTenant === tenant.id ? null : tenant.id)}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">
                          {tenant.name} {tenant.surname}
                        </span>
                        <Badge variant="outline">{tenant.residence}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-gray-500">Room:</span>
                          <span className="ml-1 font-medium">{tenant.roomNumber}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Requests:</span>
                          <span className="ml-1 font-medium">{tenantRequests.length}</span>
                          {activeRequests > 0 && (
                            <span className="ml-1 text-orange-600">({activeRequests} active)</span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          {expandedTenant === tenant.id ? "Hide Details" : "View Details"}
                        </Button>
                      </div>
                    </div>

                    {expandedTenant === tenant.id && (
                      <div className="p-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <h3 className="font-medium">Tenant Information</h3>
                            <div className="grid gap-2">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm">{tenant.email}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm">{tenant.contactNumber}</span>
                              </div>
                              <div className="flex items-start">
                                <span className="text-sm text-gray-500 mr-2">Tenant Code:</span>
                                <span className="text-sm font-mono">{tenant.tenantCode}</span>
                              </div>
                              <div className="flex items-start">
                                <span className="text-sm text-gray-500 mr-2">Registered:</span>
                                <span className="text-sm">{formatDate(tenant.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-medium">Request Summary</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 bg-gray-50 rounded">
                                <div className="text-sm text-gray-500">Total Requests</div>
                                <div className="text-xl font-medium">{tenantRequests.length}</div>
                              </div>
                              <div className="p-2 bg-gray-50 rounded">
                                <div className="text-sm text-gray-500">Active Requests</div>
                                <div className="text-xl font-medium">{activeRequests}</div>
                              </div>
                              <div className="p-2 bg-gray-50 rounded">
                                <div className="text-sm text-gray-500">Completed</div>
                                <div className="text-xl font-medium">
                                  {tenantRequests.filter((r) => r.status === "Completed").length}
                                </div>
                              </div>
                              <div className="p-2 bg-gray-50 rounded">
                                <div className="text-sm text-gray-500">High Urgency</div>
                                <div className="text-xl font-medium">
                                  {tenantRequests.filter((r) => r.urgencyLevel === "High").length}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {tenantRequests.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="font-medium">Recent Requests</h3>
                            <div className="border rounded overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      ID
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Issue
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Urgency
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Date
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {tenantRequests.slice(0, 5).map((request) => (
                                    <tr key={request.id}>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">
                                        {request.waitingNumber}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm">{request.issueLocation}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <Badge
                                          variant="outline"
                                          className={
                                            request.urgencyLevel === "High"
                                              ? "text-red-600 border-red-200"
                                              : request.urgencyLevel === "Medium"
                                                ? "text-yellow-600 border-yellow-200"
                                                : "text-green-600 border-green-200"
                                          }
                                        >
                                          {request.urgencyLevel}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <Badge
                                          variant="outline"
                                          className={
                                            request.status === "Completed"
                                              ? "text-green-600 border-green-200"
                                              : "text-orange-600 border-orange-200"
                                          }
                                        >
                                          {request.status}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        {formatDate(request.submittedAt)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {tenantRequests.length > 5 && (
                                <div className="p-2 text-center text-sm text-gray-500">
                                  Showing 5 of {tenantRequests.length} requests
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
