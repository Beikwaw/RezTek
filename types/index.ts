export interface Feedback {
  id: string;
  tenantId: string;
  tenantName: string;
  message: string;
  imageUrls: string[];
  createdAt: Date;
  status: 'pending' | 'completed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'tenant';
  urgency?: 'high' | 'normal';
}

export interface TenantImage {
  id: string;
  url: string;
  tenantId: string;
  tenantName: string;
  feedback?: string;
  createdAt: Date;
} 