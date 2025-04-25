"use client"

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FeedbackStars } from '../maintenance/FeedbackStars'
import { formatDate } from '@/lib/utils'

interface Feedback {
  id: string
  requestId: string
  tenantId: string
  tenantName: string
  rating: number
  comment: string
  createdAt: Date
}

export function FeedbackView() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'feedback'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const feedbackData: Feedback[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          feedbackData.push({
            id: doc.id,
            requestId: data.requestId,
            tenantId: data.tenantId,
            tenantName: data.tenantName,
            rating: data.rating,
            comment: data.comment,
            createdAt: data.createdAt?.toDate() || new Date(),
          })
        })
        setFeedbacks(feedbackData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching feedback:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <div>Loading feedback...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{feedback.tenantName}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(feedback.createdAt)}
                  </p>
                </div>
                <FeedbackStars rating={feedback.rating} readonly />
              </div>
              {feedback.comment && (
                <p className="text-gray-700">{feedback.comment}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
