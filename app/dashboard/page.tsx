import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { AdminDashboard } from '@/components/AdminDashboard';
import { TenantFeedback } from '@/components/TenantFeedback';
import { User } from '@/types';

interface CustomSession {
  user: User;
}

export default async function DashboardPage() {
  const session = (await getServerSession()) as CustomSession | null;

  if (!session?.user) {
    redirect('/auth/signin');
    return null; // This line will never execute due to redirect
  }

  const { user } = session;
  const isAdmin = user.role === 'admin';

  return (
    <main>
      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Tenant Dashboard</h1>
          <TenantFeedback 
            tenantId={user.id} 
            tenantName={user.name} 
          />
        </div>
      )}
    </main>
  );
} 