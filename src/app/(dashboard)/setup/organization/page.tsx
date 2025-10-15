"use client";

import { useAuth } from '@/contexts/auth-context';
import { OrganizationForm } from '@/components/organization-form';
import { ProtectedRoute } from '@/components/protected-route';

export default function OrganizationSetupPage() {
  const { organizations } = useAuth();

  // If user already has organizations, redirect to dashboard
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
