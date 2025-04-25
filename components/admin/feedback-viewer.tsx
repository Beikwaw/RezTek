"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Star, StarHalf, Download, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Feedback, MaintenanceRequest, Residence } from "@/lib/types"

interface EnrichedFeedback extends Feedback {
  request?: MaintenanceRequest
}

interface FeedbackViewerProps {
  feedback: Feedback[]
  requests: MaintenanceRequest[]
}

// Sample feedback data for demonstration
const sampleFeedback = [
  {
    id: "1",
    requestId: "mock1",
    rating: 4,
    description: "The maintenance team was very prompt and fixed the issue quickly. Very satisfied with the service.",
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: "2",
    requestId: "mock2",
    rating: 5,
    description: "Excellent service! The technician was professional and thorough.",
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: "3",
    requestId: "mock3",
    rating: 3,
    description: "The issue was fixed but it took longer than expected.",
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: "4",
    requestId: "mock4",
    rating: 2,
    description: "Had to follow up multiple times before the issue was resolved. Communication could be improved.",
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    id: "5",
    requestId: "mock5",
    rating: 5,
    description: "Very impressed with how quickly my request was handled. Thank you!",
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  },
  {
    id: "6",
    requestId: "mock6",
    rating: 1,
    description: "Issue still not fixed properly after multiple visits. Very disappointed.",
    submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
  },
  {
    id: "7",
    requestId: "mock7",
    rating: 4,
    description: "Good service overall. The technician was knowledgeable and friendly.",
    submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
  },
  {
    id: "8",
    requestId: "mock8",
    rating: 3,
    description: "Average service. The issue was fixed but took longer than expected.",
    submittedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
  },
]

export function FeedbackViewer({ feedback = sampleFeedback, requests }: FeedbackViewerProps) {
  const [residenceFilter, setResidenceFilter] = useState<Residence | "All">("All")
  const [ratingFilter, setRatingFilter] = useState<number | "All">("All")
  const [selectedFeedback, setSelectedFeedback] = useState<EnrichedFeedback | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Combine feedback with request data
  const enrichedFeedback: EnrichedFeedback[] = feedback.map((fb) => {
    const request = requests.find((req) => req.id === fb.requestId)
    return {
      ...fb,
      request,
    }
  })

  // Filter feedback
  const filteredFeedback = enrichedFeedback.filter((fb) => {
    const matchesResidence = residenceFilter === "All" || fb.request?.tenant?.residence === residenceFilter
    const matchesRating = ratingFilter === "All" || fb.rating === ratingFilter
    return matchesResidence && matchesRating
  })

  // Calculate average ratings
  const calculateAverageRating = (feedbackList: typeof enrichedFeedback) => {
    if (feedbackList.length === 0) return 0
    const sum = feedbackList.reduce((acc, fb) => acc + fb.rating, 0)
    return sum / feedbackList.length
  }

  const overallAverage = calculateAverageRating(enrichedFeedback)

  const saltRiverFeedback = enrichedFeedback.filter((fb) => fb.request?.tenant?.residence === "My Domain Salt River")
  const observatoryFeedback = enrichedFeedback.filter((fb) => fb.request?.tenant?.residence === "My Domain Observatory")

  const saltRiverAverage = calculateAverageRating(saltRiverFeedback)
  const observatoryAverage = calculateAverageRating(observatoryFeedback)

  // Calculate ratings by issue location
  const ratingsByLocation = {
    Kitchen: calculateAverageRating(enrichedFeedback.filter((fb) => fb.request?.issueLocation === "Kitchen")),
    Bathroom: calculateAverageRating(enrichedFeedback.filter((fb) => fb.request?.issueLocation === "Bathroom")),
    Bedroom: calculateAverageRating(enrichedFeedback.filter((fb) => fb.request?.issueLocation === "Bedroom")),
    Utilities: calculateAverageRating(enrichedFeedback.filter((fb) => fb.request?.issueLocation === "Utilities")),
  }

  // View feedback details
  const viewFeedbackDetails = (feedback: EnrichedFeedback) => {
    setSelectedFeedback(feedback)
    setIsDialogOpen(true)
  }

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

  // Export feedback as CSV
  const exportFeedbackCSV = () => {
    const headers = ["Date", "Request ID", "Residence", "Location", "Rating", "Comments"]

    const rows = filteredFeedback.map((fb) => [
      fb.submittedAt.toLocaleDateString(),
      fb.request?.waitingNumber || "Unknown",
      fb.request?.tenant?.residence || "Unknown",
      fb.request?.issueLocation || "Unknown",
      (fb.rating ?? 0).toString(),
      `"${(fb.description || "").replace(/"/g, '""')}"`,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `feedback-export-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Student Feedback
          </CardTitle>
          <CardDescription>View and analyze tenant feedback on maintenance services</CardDescription>
        </div>
        <Button variant="outline" onClick={exportFeedbackCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Detailed Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{overallAverage.toFixed(1)}</div>
                    <div className="flex justify-center my-2">{renderStars(overallAverage)}</div>
                    <div className="text-sm text-gray-500">Overall Rating</div>
                    <div className="text-xs text-gray-400 mt-1">Based on {feedback.length} reviews</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{saltRiverAverage.toFixed(1)}</div>
                    <div className="flex justify-center my-2">{renderStars(saltRiverAverage)}</div>
                    <div className="text-sm text-gray-500">Salt River Rating</div>
                    <div className="text-xs text-gray-400 mt-1">Based on {saltRiverFeedback.length} reviews</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{observatoryAverage.toFixed(1)}</div>
                    <div className="flex justify-center my-2">{renderStars(observatoryAverage)}</div>
                    <div className="text-sm text-gray-500">Observatory Rating</div>
                    <div className="text-xs text-gray-400 mt-1">Based on {observatoryFeedback.length} reviews</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ratings by Issue Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(ratingsByLocation).map(([location, rating]) => (
                    <div key={location} className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium mb-2">{location}</div>
                      <div className="flex items-center mb-1">
                        {renderStars(rating)}
                        <span className="ml-2 text-sm">{rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = enrichedFeedback.filter((fb) => fb.rating === rating).length
                    const percentage =
                      enrichedFeedback.length > 0 ? Math.round((count / enrichedFeedback.length) * 100) : 0

                    return (
                      <div key={rating} className="flex items-center">
                        <div className="w-16 flex items-center">
                          <span className="mr-1">{rating}</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 mx-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                        <div className="w-16 text-right text-sm text-gray-500">
                          {count} ({percentage}%)
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Select
                  value={residenceFilter}
                  onValueChange={(value) => setResidenceFilter(value as Residence | "All")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by residence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Residences</SelectItem>
                    <SelectItem value="My Domain Salt River">My Domain Salt River</SelectItem>
                    <SelectItem value="My Domain Observatory">My Domain Observatory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select
                  value={ratingFilter.toString()}
                  onValueChange={(value) => setRatingFilter(value === "All" ? "All" : Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No feedback found matching your filters.</div>
            ) : (
              <div className="space-y-4">
                {filteredFeedback.map((fb) => (
                  <Card key={fb.id} className="overflow-hidden">
                    <div className="p-4 bg-gray-50 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center">
                        <div className="flex mr-2">{renderStars(fb.rating)}</div>
                        <span className="text-sm text-gray-500">{fb.submittedAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {fb.request?.tenant?.residence && (
                          <Badge variant="outline">{fb.request.tenant.residence}</Badge>
                        )}
                        {fb.request?.issueLocation && <Badge variant="outline">{fb.request.issueLocation}</Badge>}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-700 line-clamp-2">{fb.description}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          Request ID: {fb.request?.waitingNumber || "Unknown"}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => viewFeedbackDetails(fb)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Feedback Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>Submitted on {selectedFeedback?.submittedAt.toLocaleDateString()}</DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-2">Rating:</div>
                <div className="flex">{renderStars(selectedFeedback.rating)}</div>
              </div>

              <div>
                <div className="font-medium mb-1">Comments:</div>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedFeedback.description}</p>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Request Information:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Request ID:</div>
                  <div>{selectedFeedback.request?.waitingNumber || "Unknown"}</div>

                  <div className="text-gray-500">Issue Location:</div>
                  <div>{selectedFeedback.request?.issueLocation || "Unknown"}</div>

                  <div className="text-gray-500">Residence:</div>
                  <div>{selectedFeedback.request?.tenant?.residence || "Unknown"}</div>

                  <div className="text-gray-500">Tenant:</div>
                  <div>
                    {selectedFeedback.request?.tenant
                      ? `${selectedFeedback.request.tenant.name} ${selectedFeedback.request.tenant.surname}`
                      : "Unknown"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
