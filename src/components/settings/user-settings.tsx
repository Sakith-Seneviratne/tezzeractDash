"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Bell, 
  Palette,
  Save,
  Upload,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface UserSettings {
  full_name: string;
  email: string;
  avatar_url?: string;
  notification_preferences: {
    email_notifications: boolean;
    push_notifications: boolean;
    weekly_reports: boolean;
    content_reminders: boolean;
  };
  theme_preference: 'light' | 'dark' | 'system';
}

export function UserSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    full_name: '',
    email: '',
    avatar_url: '',
    notification_preferences: {
      email_notifications: true,
      push_notifications: true,
      weekly_reports: true,
      content_reminders: true,
    },
    theme_preference: 'system',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Initialize with default settings since we don't have user auth
    setSettings(prev => ({
      ...prev,
      full_name: 'User',
      email: 'user@example.com',
      avatar_url: '',
    }));
  }, []);

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) return;
    
    try {
      // Clear all localStorage data
      localStorage.clear();
      
      // Sign out from Supabase
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
      // Force redirect even if there's an error
      window.location.href = '/login';
    }
  };

  const handleSave = async () => {
    if (!supabase) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: settings.full_name,
          avatar_url: settings.avatar_url,
          notification_preferences: settings.notification_preferences,
          theme_preference: settings.theme_preference,
        }
      });

      if (error) {
        console.error('Error updating user settings:', error);
        return;
      }

      // Show success message
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !supabase) return;

    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `user-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setSettings(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>User Settings</span>
        </CardTitle>
        <CardDescription>
          Manage your personal profile and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Profile Information</h3>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {settings.avatar_url ? (
                  <img 
                    src={settings.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div>
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Avatar
                </label>
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={settings.full_name}
                onChange={(e) => setSettings(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Preferences</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your account
                </p>
              </div>
              <input
                type="checkbox"
                id="email_notifications"
                checked={settings.notification_preferences.email_notifications}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notification_preferences: {
                    ...prev.notification_preferences,
                    email_notifications: e.target.checked
                  }
                }))}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push_notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser notifications
                </p>
              </div>
              <input
                type="checkbox"
                id="push_notifications"
                checked={settings.notification_preferences.push_notifications}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notification_preferences: {
                    ...prev.notification_preferences,
                    push_notifications: e.target.checked
                  }
                }))}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly_reports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Get weekly performance summaries
                </p>
              </div>
              <input
                type="checkbox"
                id="weekly_reports"
                checked={settings.notification_preferences.weekly_reports}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notification_preferences: {
                    ...prev.notification_preferences,
                    weekly_reports: e.target.checked
                  }
                }))}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="content_reminders">Content Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders for scheduled content
                </p>
              </div>
              <input
                type="checkbox"
                id="content_reminders"
                checked={settings.notification_preferences.content_reminders}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notification_preferences: {
                    ...prev.notification_preferences,
                    content_reminders: e.target.checked
                  }
                }))}
                className="h-4 w-4"
              />
            </div>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Theme Preference</span>
          </h3>
          
          <div>
            <Label htmlFor="theme">Theme</Label>
            <select
              id="theme"
              value={settings.theme_preference}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                theme_preference: e.target.value as 'light' | 'dark' | 'system' 
              }))}
              className="w-full p-2 border rounded-md mt-1"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <p className="text-sm text-muted-foreground mt-1">
              Choose your preferred theme or use system settings
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button 
            onClick={handleLogout} 
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
