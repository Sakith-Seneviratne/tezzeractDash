"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { OrganizationForm } from '@/components/organization-form';
import { ProtectedRoute } from '@/components/protected-route';

export default function OrganizationSetupPage() {
  const { organizations, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user already has organizations, redirect to dashboard
    if (!loading && organizations.length > 0) {
      router.push('/dashboard');
    }
  }, [organizations, loading, router]);

  // Show loading while checking organizations
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gradient-start to-gradient-end p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  // If user already has organizations, show redirecting message
  if (organizations.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gradient-start to-gradient-end p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">You already have an organization!</h1>
          <p className="text-white/80">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireOrganization={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gradient-start to-gradient-end p-4">
        <OrganizationForm />
      </div>
    </ProtectedRoute>
  );
}
