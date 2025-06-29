import { UserSettingsForm } from '@/components/dashboard/settings-form';
import { findUserById } from '@/lib/data';
import type { Role } from '@/lib/types';
import { redirect } from 'next/navigation';

interface SettingsPageProps {
  searchParams: {
    role?: Role;
    userId?: string;
  };
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { userId } = searchParams;

  if (!userId) {
    redirect('/');
  }

  const user = await findUserById(userId);

  if (!user) {
    redirect('/?error=User not found');
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <UserSettingsForm user={user} />
    </div>
  );
}
