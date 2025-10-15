"use client";

import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, selectedOrganization, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!selectedOrganization) {
        router.push('/setup/organization');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, selectedOrganization, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
}