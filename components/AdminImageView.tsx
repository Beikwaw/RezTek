import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TenantImage {
  id: string;
  url: string;
  tenantId: string;
  tenantName: string;
  urgency: string;
  requestId?: string;
  uploadedAt: Date;
}

export function AdminImageView() {
  const [images, setImages] = useState<TenantImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenantImages = async () => {
      try {
        // Get all high urgency tenants
        const tenantsQuery = query(
          collection(db, 'tenants'),
          where('urgency', '==', 'high')
        );
        const tenantsSnapshot = await getDocs(tenantsQuery);
        
        const tenantImages: TenantImage[] = [];
        
        for (const tenantDoc of tenantsSnapshot.docs) {
          const tenantData = tenantDoc.data();
          
          // Get tenant's images
          const { urls } = await getTenantImages(tenantDoc.id);
          
          // Get maintenance requests for this tenant
          const requestsQuery = query(
            collection(db, 'maintenanceRequests'),
            where('tenantId', '==', tenantDoc.id)
          );
          const requestsSnapshot = await getDocs(requestsQuery);
          
          urls.forEach((url, index) => {
            tenantImages.push({
              id: `${tenantDoc.id}-${index}`,
              url,
              tenantId: tenantDoc.id,
              tenantName: tenantData.name,
              urgency: tenantData.urgency,
              requestId: requestsSnapshot.docs[0]?.id,
              uploadedAt: new Date()
            });
          });
        }
        
        setImages(tenantImages);
      } catch (err) {
        setError('Failed to load tenant images');
        console.error('Error loading tenant images:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantImages();
  }, []);

  if (loading) {
    return <div>Loading tenant images...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <div className="relative h-48">
            <Image
              src={image.url}
              alt={`Image for ${image.tenantName}`}
              fill
              className="object-cover"
            />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{image.tenantName}</span>
              <Badge variant={image.urgency === 'high' ? 'destructive' : 'default'}>
                {image.urgency}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Tenant ID: {image.tenantId}
              </p>
              {image.requestId && (
                <p className="text-sm text-gray-500">
                  Request ID: {image.requestId}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Uploaded: {image.uploadedAt.toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 