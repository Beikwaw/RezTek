"use client"

import { useState } from 'react'
import { ThankYouDialog } from './ThankYouDialog'
import { auth, db } from '@/lib/firebase'
import { collection, addDoc, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { FeedbackStars } from './FeedbackStars'
import { Card, CardContent } from '@/components/ui/card'

interface MaintenanceFeedbackProps {
  requestId: string
  onFeedbackSubmitted?: () => void
  existingFeedback?: boolean
}

export default function MaintenanceFeedback({ requestId, onFeedbackSubmitted, existingFeedback = false }: MaintenanceFeedbackProps) {
  if (existingFeedback) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            You have already submitted feedback for this request.
          </div>
        </CardContent>
      </Card>
    )
  }
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { currentUser } = auth
      if (!currentUser) throw new Error("Not authenticated")

      const tenantDoc = await getDoc(doc(db, "tenants", currentUser.uid))
      if (!tenantDoc.exists()) throw new Error("Tenant not found")

      await addDoc(collection(db, "feedback"), {
        userId: currentUser.uid,
        tenantId: currentUser.uid,
        tenantName: tenantDoc.data().name,
        requestId,
        rating,
        description: comment,
        submittedAt: serverTimestamp(),
      })

      // Update maintenance request to mark it as having feedback
      const requestRef = doc(db, 'maintenanceRequests', requestId)
      await updateDoc(requestRef, {
        hasFeedback: true,
        rating,
      })

      setRating(0)
      setComment('')
      setShowThankYou(true)

      // Call the callback if provided
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted()
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Rate your experience
          </label>
          <FeedbackStars rating={rating} onRatingChange={setRating} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Additional Comments (Optional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about the maintenance service..."
            className="min-h-[100px]"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </form>
      <ThankYouDialog
        open={showThankYou}
        onClose={() => {
          setShowThankYou(false)
          if (onFeedbackSubmitted) {
            onFeedbackSubmitted()
          }
        }}
      />
    </div>
  )
}
