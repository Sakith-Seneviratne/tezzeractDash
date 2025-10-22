"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Mail,
  Crown,
  Shield,
  User,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface OrganizationMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  user: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  created_at: string;
}

export function OrganizationAccess() {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<{id: string} | null>(null);
  const [user, setUser] = useState<{id: string, email?: string} | null>(null);
  const supabase = createClient();
  
  useEffect(() => {
    const orgData = localStorage.getItem('organization_data');
    if (orgData) {
      setSelectedOrganization(JSON.parse(orgData));
    }
    if (supabase) {
      supabase.auth.getUser().then(({data}) => setUser(data.user));
    }
  }, []);

  useEffect(() => {
    if (selectedOrganization) {
      fetchMembers();
    }
  }, [selectedOrganization]);

  const fetchMembers = async () => {
    if (!selectedOrganization || !supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          user:users(email, full_name, avatar_url)
        `)
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching members:', error);
        return;
      }

      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrganization || !inviteEmail || !supabase) return;

    setInviting(true);
    try {
      // In a real app, you would send an invitation email
      // For now, we'll just add the member directly
      const { data: inviteeUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', inviteEmail)
        .single();

      if (userError || !inviteeUser) {
        console.error('User not found:', userError);
        alert('User not found. Please make sure they have an account.');
        return;
      }

      const { error: insertError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: selectedOrganization.id,
          user_id: inviteeUser.id,
          role: inviteRole,
        });

      if (insertError) {
        console.error('Error inviting member:', insertError);
        return;
      }

      setInviteEmail('');
      setInviteRole('member');
      await fetchMembers();
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        return;
      }

      await fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) {
        console.error('Error updating role:', error);
        return;
      }

      await fetchMembers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isCurrentUser = (member: OrganizationMember) => {
    return member.user_id === user?.id;
  };

  const canManageMember = (member: OrganizationMember) => {
    if (isCurrentUser(member)) return false;
    // Only owners and admins can manage members
    const currentUserMember = members.find(m => m.user_id === user?.id);
    return currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Organization Access</span>
        </CardTitle>
        <CardDescription>
          Manage team members and their access levels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite Member */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Invite Member</span>
          </h3>
          
          <form onSubmit={handleInviteMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invite_email">Email Address</Label>
                <Input
                  id="invite_email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="invite_role">Role</Label>
                <select
                  id="invite_role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={inviting}>
              <Mail className="h-4 w-4 mr-2" />
              {inviting ? 'Sending Invite...' : 'Send Invitation'}
            </Button>
          </form>
        </div>

        {/* Members List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Team Members</h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading members...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {member.user.avatar_url ? (
                        <img 
                          src={member.user.avatar_url} 
                          alt="Avatar" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {member.user.full_name || 'Unknown User'}
                        {isCurrentUser(member) && (
                          <span className="text-sm text-muted-foreground ml-2">(You)</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.user.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(member.role)}>
                      {getRoleIcon(member.role)}
                      <span className="ml-1 capitalize">{member.role}</span>
                    </Badge>
                    
                    {canManageMember(member) && (
                      <div className="flex items-center space-x-1">
                        {member.role !== 'owner' && (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as 'admin' | 'member')}
                            className="text-sm p-1 border rounded"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {members.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members yet. Invite someone to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Role Descriptions */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Role Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Owner</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Full access to all features, can manage organization settings, invite/remove members, and delete the organization.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Admin</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Can manage content, view analytics, invite members, and access most features. Cannot delete the organization.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Member</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Can view analytics, manage content calendar, and use content suggestions. Limited access to settings.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
