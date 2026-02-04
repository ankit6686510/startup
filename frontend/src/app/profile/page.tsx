'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks';
import { ProfileForm } from './components/ProfileForm';
import { Loading } from '@/components/ui/loading';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
          <p className="mt-2 text-slate-600">Manage your account information and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
