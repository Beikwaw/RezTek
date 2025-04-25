import React, { useState, useCallback, useEffect } from 'react';
import { uploadTenantImage, getTenantImageCount } from '@/lib/storage';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Image from 'next/image';

interface FileUploadProps {
  tenantId: string;
  onUploadComplete: (url: string) => void;
  label?: string;
}

export function FileUpload({ tenantId, onUploadComplete, label }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageCount, setImageCount] = useState(0);

  // Check current image count
  useEffect(() => {
    const checkImageCount = async () => {
      const count = await getTenantImageCount(tenantId);
      setImageCount(count);
    };
    checkImageCount();
  }, [tenantId]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if already at limit
    if (imageCount >= 2) {
      setError('Maximum of 2 images allowed');
      toast.error('Maximum of 2 images allowed');
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const { url, error } = await uploadTenantImage(file, tenantId);
      
      if (error) {
        setError(error);
        toast.error(error);
      } else {
        onUploadComplete(url);
        setImageCount(prev => prev + 1);
        toast.success('Image uploaded successfully!');
      }
    } catch (err) {
      setError('Failed to upload image');
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [onUploadComplete, tenantId, imageCount]);

  return (
    <div className="space-y-4">
      {label && <label className="block text-sm font-medium">{label}</label>}
      
      <div className="flex items-center space-x-4">
        <Input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          disabled={isUploading || imageCount >= 2}
          className="flex-1"
        />
        
        {isUploading && (
          <Button variant="outline" disabled>
            Uploading...
          </Button>
        )}
      </div>

      {isUploading && (
        <Progress value={progress} className="w-full" />
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {imageCount >= 2 && (
        <p className="text-sm text-yellow-500">
          You have reached the maximum limit of 2 images
        </p>
      )}
    </div>
  );
} 