"use client"

import { Star } from 'lucide-react'

interface FeedbackStarsProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
}

export function FeedbackStars({ rating, onRatingChange, readonly = false }: FeedbackStarsProps) {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            readonly ? '' : 'hover:text-yellow-500'
          } ${
            star <= rating
              ? 'text-yellow-400'
              : 'text-gray-300'
          }`}
        >
          <Star className="h-6 w-6 fill-current" />
        </button>
      ))}
    </div>
  )
}
