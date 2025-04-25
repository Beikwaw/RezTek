"use client"

import { useState } from 'react';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface RequestFeedbackProps {
  requestId: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  onFeedbackSubmitted?: () => void;
}

export function RequestFeedback({ requestId, tenantId, tenantName, userId, onFeedbackSubmitted }: RequestFeedbackProps) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      if (newImages.length > 2) {
        toast({
          title: 'Error',
          description: 'You can only upload up to 2 images',
          variant: 'destructive',
        });
        return;
      }
      setImages(newImages);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images if any
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const storageRef = ref(storage, `feedback/${requestId}/images/${image.name}`);
          await uploadBytes(storageRef, image);
          return getDownloadURL(storageRef);
        })
      );

      // Create feedback document
      const feedbackData = {
        requestId, // Link to maintenance request
        userId, // For security rules
        tenantId, // For tenant identification
        tenantName,
        message,
        imageUrls,
        createdAt: new Date(),
        status: 'submitted',
      };

      // Add feedback
      await addDoc(collection(db, 'feedback'), feedbackData);

      // Update maintenance request to mark it as having feedback
      const requestRef = doc(db, 'maintenanceRequests', requestId);
      await updateDoc(requestRef, {
        hasFeedback: true,
      });

      setMessage('');
      setImages([]);
      toast({
        title: 'Success',
        description: 'Feedback submitted successfully',
      });

      // Call the callback if provided
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Your Feedback
        </label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please share your feedback about the maintenance service..."
          required
          className="min-h-[100px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Upload Images (Optional, Max 2)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-primary file:text-white
            hover:file:bg-primary/90"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  );
}
