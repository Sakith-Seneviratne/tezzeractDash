"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Organization } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  organizations: Organization[];
  selectedOrganization: Organization | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setSelectedOrganization: (org: Organization) => void;
  refreshOrganizations: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          setUser(null);
          setOrganizations([]);
          setSelectedOrganization(null);
          setLoading(false);
          return;
        }
        
        if (authUser) {
          const userData: User = {
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name,
            avatar_url: authUser.user_metadata?.avatar_url,
            created_at: authUser.created_at,
          };
          setUser(userData);
          await fetchOrganizations(userData.id);
        } else {
          setUser(null);
          setOrganizations([]);
          setSelectedOrganization(null);
        }
        setLoading(false);
      } catch (err) {
        console.error('AuthContext: Unexpected error:', err);
        setUser(null);
        setOrganizations([]);
        setSelectedOrganization(null);
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setOrganizations([]);
          setSelectedOrganization(null);
          router.push('/login');
        } else if (event === 'SIGNED_IN' && session.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at,
          };
          setUser(userData);
          await fetchOrganizations(userData.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const fetchOrganizations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          organizations (
            id,
            name,
            slug,
            created_at,
            settings
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching organizations:', error);
        setOrganizations([]);
        return;
      }

      if (data) {
        const orgs = data
          .map(item => item.organizations)
          .filter(Boolean)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((org: any) => ({
            id: org.id,
            name: org.name,
            slug: org.slug,
            created_at: org.created_at,
            settings: org.settings || {}
          })) as Organization[];
        
        setOrganizations(orgs);
        
        // Set first organization as selected if none selected
        if (orgs.length > 0 && !selectedOrganization) {
          setSelectedOrganization(orgs[0]);
        }
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    }
  };

  const refreshOrganizations = async () => {
    if (user) {
      await fetchOrganizations(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    organizations,
    selectedOrganization,
    loading,
    signOut,
    setSelectedOrganization,
    refreshOrganizations,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
