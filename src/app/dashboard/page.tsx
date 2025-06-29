import StudentDashboard from '@/components/dashboard/student-dashboard';
import StaffDashboard from '@/components/dashboard/staff-dashboard';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import type { Role } from '@/lib/types';
import { getReceipts, getReceiptsByStudentId, findUserById } from '@/lib/data';
import { redirect } from 'next/navigation';

interface DashboardPageProps {
  searchParams: {
    role?: Role;
    userId?: string;
  };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const role = searchParams.role;
  const userId = searchParams.userId;

  if (!role || !userId) {
    // If role or userId is missing, redirect to login
    redirect('/');
  }

  // Validate user
  const user = await findUserById(userId);
  if (!user || user.role !== role) {
    // If user not found or role doesn't match, redirect to login
    redirect('/');
  }

  // Fetch data on the server based on the role
  const allReceipts = await getReceipts();
  const studentReceipts = await getReceiptsByStudentId(userId);

  return (
    <div className="w-full space-y-6">
      {role === 'student' && <StudentDashboard receipts={studentReceipts} studentId={userId} />}
      {role === 'staff' && <StaffDashboard receipts={allReceipts.filter(r => r.status === 'Approved')} />}
      {role === 'admin' && <AdminDashboard receipts={allReceipts} />}
    </div>
  );
}
