"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { MaintenanceRequest, Residence } from "@/lib/types"

interface AnalyticsDashboardProps {
  requests: MaintenanceRequest[]
  selectedResidence: Residence | "All"
}

export function AnalyticsDashboard({ requests, selectedResidence }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days" | "all">("30days")
  const [dateRange, setDateRange] = useState<"daily" | "weekly" | "monthly">("daily")

  // Filter requests by time range
  const getFilteredRequests = () => {
    if (timeRange === "all") return requests

    const now = new Date()
    let daysAgo: number

    switch (timeRange) {
      case "7days":
        daysAgo = 7
        break
      case "30days":
        daysAgo = 30
        break
      case "90days":
        daysAgo = 90
        break
      default:
        daysAgo = 30
    }

    const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo))
    return requests.filter((req) => req.submittedAt >= cutoffDate)
  }

  const filteredRequests = getFilteredRequests()

  // Prepare data for charts
  const prepareChartData = (residence: Residence) => {
    const residenceRequests = filteredRequests.filter((req) => req.tenant?.residence === residence)

    // Group by date
    const groupedByDate = residenceRequests.reduce(
      (acc, request) => {
        const date = request.submittedAt.toISOString().split("T")[0] // YYYY-MM-DD

        if (!acc[date]) {
          acc[date] = {
            date,
            pending: 0,
            completed: 0,
          }
        }

        if (request.status === "Completed") {
          acc[date].completed += 1
        } else {
          acc[date].pending += 1
        }

        return acc
      },
      {} as Record<string, { date: string; pending: number; completed: number }>,
    )

    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const saltRiverData = prepareChartData("My Domain Salt River")
  const observatoryData = prepareChartData("My Domain Observatory")

  // Calculate analytics data
  const totalRequests = filteredRequests.length

  // Requests by residence
  const requestsByResidence = {
    "My Domain Salt River": filteredRequests.filter((req) => req.tenant?.residence === "My Domain Salt River").length,
    "My Domain Observatory": filteredRequests.filter((req) => req.tenant?.residence === "My Domain Observatory").length,
    Unknown: filteredRequests.filter((req) => !req.tenant?.residence).length,
  }

  // Requests by urgency
  const requestsByUrgency = {
    Low: filteredRequests.filter((req) => req.urgencyLevel === "Low").length,
    Medium: filteredRequests.filter((req) => req.urgencyLevel === "Medium").length,
    High: filteredRequests.filter((req) => req.urgencyLevel === "High").length,
  }

  // Requests by status
  const requestsByStatus = {
    Submitted: filteredRequests.filter((req) => req.status === "Submitted").length,
    "Application Viewed": filteredRequests.filter((req) => req.status === "Application Viewed").length,
    Pending: filteredRequests.filter((req) => req.status === "Pending").length,
    Completed: filteredRequests.filter((req) => req.status === "Completed").length,
  }

  // Calculate completion rate
  const completionRate = totalRequests > 0 ? Math.round((requestsByStatus.Completed / totalRequests) * 100) : 0

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-ZA", { month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{selectedResidence === "All" ? "All Residences" : selectedResidence}</h3>
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalRequests}</div>
            <div className="text-sm text-gray-500">Total Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{requestsByUrgency.High}</div>
            <div className="text-sm text-gray-500">High Urgency</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{requestsByStatus.Completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{completionRate}%</div>
            <div className="text-sm text-gray-500">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="salt-river" className="mt-6">
        <TabsList>
          <TabsTrigger value="salt-river">Salt River</TabsTrigger>
          <TabsTrigger value="observatory">Observatory</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="salt-river" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>My Domain Salt River - Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    pending: {
                      label: "Pending Requests",
                      color: "hsl(var(--chart-1))",
                    },
                    completed: {
                      label: "Completed Requests",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={saltRiverData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="pending" name="Pending" fill="var(--color-pending)" />
                      <Bar dataKey="completed" name="Completed" fill="var(--color-completed)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              {saltRiverData.length === 0 && (
                <div className="text-center py-4 text-gray-500">No data available for the selected time range.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="observatory" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>My Domain Observatory - Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    pending: {
                      label: "Pending Requests",
                      color: "hsl(var(--chart-1))",
                    },
                    completed: {
                      label: "Completed Requests",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={observatoryData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="pending" name="Pending" fill="var(--color-pending)" />
                      <Bar dataKey="completed" name="Completed" fill="var(--color-completed)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              {observatoryData.length === 0 && (
                <div className="text-center py-4 text-gray-500">No data available for the selected time range.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Residence Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Salt River",
                        pending: saltRiverData.reduce((sum, item) => sum + item.pending, 0),
                        completed: saltRiverData.reduce((sum, item) => sum + item.completed, 0),
                      },
                      {
                        name: "Observatory",
                        pending: observatoryData.reduce((sum, item) => sum + item.pending, 0),
                        completed: observatoryData.reduce((sum, item) => sum + item.completed, 0),
                      },
                    ]}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pending" name="Pending" fill="#8884d8" />
                    <Bar dataKey="completed" name="Completed" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
