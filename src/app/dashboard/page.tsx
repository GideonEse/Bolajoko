import StudentDashboard from '@/components/dashboard/student-dashboard';
import StaffDashboard from '@/components/dashboard/staff-dashboard';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import type { Role } from '@/lib/types';

interface DashboardPageProps {
  searchParams: {
    role?: Role;
  };
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  const role = searchParams.role || 'student';

  return (
    <div className="w-full space-y-6">
      {role === 'student' && <StudentDashboard />}
      {role === 'staff' && <StaffDashboard />}
      {role === 'admin' && <AdminDashboard />}
    </div>
  );
}
