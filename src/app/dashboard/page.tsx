import StudentDashboard from '@/components/dashboard/student-dashboard';
import StaffDashboard from '@/components/dashboard/staff-dashboard';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import type { Role } from '@/lib/types';
import { getReceipts, getReceiptsByStudentId } from '@/lib/data';

interface DashboardPageProps {
  searchParams: {
    role?: Role;
    userId?: string;
  };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const role = searchParams.role || 'student';
  const userId = searchParams.userId || '1'; // Default to user 1 if not provided

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
