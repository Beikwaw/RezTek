"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import MaintenanceFeedback from "@/components/maintenance/MaintenanceFeedback"
import type { MaintenanceRequest, RequestStatus } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy, onSnapshot, DocumentData, FirestoreError } from "firebase/firestore"

export default function RequestHistory() {
  const { tenant } = useAuth()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeRequest, setActiveRequest] = useState<string | null>(null)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadFeedbackStatus = async () => {
      if (!tenant) return

      const feedbackQuery = query(
        collection(db, "feedback"),
        where("userId", "==", tenant.id)
      )

      const feedbackDocs = await getDocs(feedbackQuery)
      const feedbackStatus: Record<string, boolean> = {}
      
      feedbackDocs.forEach((doc: DocumentData) => {
        const feedback = doc.data()
        if (feedback.requestId) {
          feedbackStatus[feedback.requestId] = true
        }
      })

      setFeedbackSubmitted(feedbackStatus)
    }

    loadFeedbackStatus()
  }, [tenant])

  useEffect(() => {
    if (!tenant) return

    setLoading(true)
    setError("")

    try {
      const requestQuery = query(
        collection(db, "maintenanceRequests"),
        where("tenantId", "==", tenant.id),
        orderBy("submittedAt", "desc"),
      )

      const unsubscribe = onSnapshot(
        requestQuery,
        (snapshot: DocumentData) => {
          const requestData: MaintenanceRequest[] = []
          snapshot.forEach((doc: DocumentData) => {
            const data = doc.data()
            requestData.push({
              id: doc.id,
              waitingNumber: data.waitingNumber,
              tenantId: data.tenantId,
              issueLocation: data.issueLocation,
              urgencyLevel: data.urgencyLevel,
              description: data.description,
              imageUrl: data.imageUrl,
              status: data.status,
              submittedAt: data.submittedAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            })
          })

          setRequests(requestData)
          setLoading(false)
        },
        (err: FirestoreError) => {
          console.error("Error fetching requests:", err)
          if (err.code === "failed-precondition" && err.message.includes("index")) {
            setError("The system is currently being optimized. Please try again in a few minutes.")
          } else {
            setError("Failed to load your maintenance requests. Please try again later.")
          }
          setLoading(false)
        },
      )

      return () => unsubscribe()
    } catch (err) {
      console.error("Error setting up request listener:", err)
      setError("Failed to load your maintenance requests. Please try again later.")
      setLoading(false)
    }
  }, [tenant])

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

  const handleFeedbackSubmit = () => {
    setActiveRequest(null)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>Loading your maintenance requests...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>You haven't submitted any maintenance requests yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>When you submit a request, it will appear here.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request History</CardTitle>
        <CardDescription>View and track your maintenance requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onFeedback={() => setActiveRequest(request.id)}
              isActive={activeRequest === request.id}
              getStatusColor={getStatusColor}
              tenant={tenant}
              existingFeedback={feedbackSubmitted[request.id]}
              onFeedbackSubmitted={() => {
                setFeedbackSubmitted(prev => ({
                  ...prev,
                  [request.id]: true
                }))
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface RequestCardProps {
  request: MaintenanceRequest
  onFeedback: () => void
  isActive: boolean
  getStatusColor: (status: RequestStatus) => string
  tenant: any
  existingFeedback: boolean
  onFeedbackSubmitted: () => void
}

function RequestCard({
  request,
  onFeedback,
  isActive,
  getStatusColor,
  tenant,
  existingFeedback,
  onFeedbackSubmitted,
}: RequestCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">Request #{request.waitingNumber}</h3>
          <p className="text-sm text-gray-500">{formatDate(request.submittedAt)}</p>
        </div>
        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Location:</span>
          <span>{request.issueLocation}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Urgency:</span>
          <span>{request.urgencyLevel}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Description:</span>
          <p className="mt-1">{request.description}</p>
        </div>
        {request.imageUrl && (
          <div className="mt-2">
            <img src={request.imageUrl} alt="Issue" className="rounded-md max-h-48 object-cover" />
          </div>
        )}
      </div>

      {request.status === "Completed" && (
        <div className="mt-4">
          {existingFeedback ? (
            <p className="text-sm text-gray-500">You have already submitted feedback for this request.</p>
          ) : (
            <MaintenanceFeedback
              requestId={request.id}
              existingFeedback={existingFeedback}
              onFeedbackSubmitted={onFeedbackSubmitted}
            />
          )}
        </div>
      )}
    </div>
  )
}
