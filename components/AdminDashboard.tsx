"use client"

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TenantImage } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { FeedbackView } from './admin/FeedbackView';

export function AdminDashboard() {
  const [images, setImages] = useState<TenantImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to tenant images
    const imagesQuery = query(
      collection(db, 'tenantImages'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeImages = onSnapshot(imagesQuery, (snapshot) => {
      const imagesData: TenantImage[] = [];
      snapshot.forEach((doc) => {
        imagesData.push({ id: doc.id, ...doc.data() } as TenantImage);
      });
      setImages(imagesData);
    });

    return () => {
      unsubscribeImages();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="images">
        <TabsList>
          <TabsTrigger value="images">Tenant Images</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Card key={image.id}>
                <div className="relative h-48">
                  <Image
                    src={image.url}
                    alt={`Image from ${image.tenantName}`}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{image.tenantName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Uploaded: {image.createdAt.toLocaleDateString()}
                  </p>
                  {image.feedback && (
                    <p className="mt-2 text-sm">{image.feedback}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <FeedbackView />
        </TabsContent>
      </Tabs>
    </div>
  );
} 