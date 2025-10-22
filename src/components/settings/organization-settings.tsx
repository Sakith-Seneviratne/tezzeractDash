"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Palette, 
  Save,
  Upload,
  Image,
  Settings
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface OrganizationSettings {
  name: string;
  slug: string;
  logo_url?: string;
  branding: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
  };
  default_dashboard_layout: {
    time_range: string;
    default_kpis: string[];
    layout_preference: string;
  };
}

export function OrganizationSettings() {
  const [settings, setSettings] = useState<OrganizationSettings>({
    name: '',
    slug: '',
    logo_url: '',
    branding: {
      primary_color: '#00378A',
      secondary_color: '#00A9EE',
      accent_color: '#FF6B35',
    },
    default_dashboard_layout: {
      time_range: '30d',
      default_kpis: ['impressions', 'reach', 'engagement', 'clicks'],
      layout_preference: 'grid',
    },
  });
  const [saving, setSaving] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<{id: string; name?: string; slug?: string; settings?: Record<string, unknown>} | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const orgData = localStorage.getItem('organization_data');
    if (orgData) {
      const org = JSON.parse(orgData);
      setSelectedOrganization(org);
    }
  }, []);

  useEffect(() => {
    if (selectedOrganization) {
      setSettings(prev => ({
        ...prev,
        name: selectedOrganization.name || '',
        slug: selectedOrganization.slug || '',
        logo_url: (selectedOrganization.settings?.logo_url as string) || '',
        branding: (selectedOrganization.settings?.branding as typeof prev.branding) || prev.branding,
        default_dashboard_layout: (selectedOrganization.settings?.default_dashboard_layout as typeof prev.default_dashboard_layout) || prev.default_dashboard_layout,
      }));
    }
  }, [selectedOrganization]);

  const handleSave = async () => {
    if (!selectedOrganization || !supabase) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: settings.name,
          slug: settings.slug,
          settings: {
            logo_url: settings.logo_url,
            branding: settings.branding,
            default_dashboard_layout: settings.default_dashboard_layout,
          },
        })
        .eq('id', selectedOrganization.id);

      if (error) {
        console.error('Error updating organization settings:', error);
        return;
      }

      console.log('Organization settings saved successfully');
    } catch (error) {
      console.error('Error saving organization settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedOrganization || !supabase) return;

    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedOrganization.id}.${fileExt}`;
      const filePath = `organization-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(filePath);

      setSettings(prev => ({ ...prev, logo_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
  };

  const kpiOptions = [
    { value: 'impressions', label: 'Impressions' },
    { value: 'reach', label: 'Reach' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'clicks', label: 'Clicks' },
    { value: 'conversions', label: 'Conversions' },
    { value: 'followers', label: 'Followers' },
  ];

  const handleKpiToggle = (kpi: string) => {
    setSettings(prev => ({
      ...prev,
      default_dashboard_layout: {
        ...prev.default_dashboard_layout,
        default_kpis: prev.default_dashboard_layout.default_kpis.includes(kpi)
          ? prev.default_dashboard_layout.default_kpis.filter(k => k !== kpi)
          : [...prev.default_dashboard_layout.default_kpis, kpi]
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Organization Settings</span>
        </CardTitle>
        <CardDescription>
          Manage your organization details and branding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {settings.logo_url ? (
                  <img 
                    src={settings.logo_url} 
                    alt="Organization Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div>
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </label>
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG or SVG. Max size 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="org_name">Organization Name</Label>
              <Input
                id="org_name"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter organization name"
              />
            </div>
            <div>
              <Label htmlFor="org_slug">Organization Slug</Label>
              <Input
                id="org_slug"
                value={settings.slug}
                onChange={(e) => setSettings(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="organization-slug"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Used in URLs. Only lowercase letters, numbers, and hyphens.
              </p>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Branding</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="primary_color"
                  value={settings.branding.primary_color}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    branding: { ...prev.branding, primary_color: e.target.value }
                  }))}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <Input
                  value={settings.branding.primary_color}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    branding: { ...prev.branding, primary_color: e.target.value }
                  }))}
                  placeholder="#00378A"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="secondary_color"
                  value={settings.branding.secondary_color}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    branding: { ...prev.branding, secondary_color: e.target.value }
                  }))}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <Input
                  value={settings.branding.secondary_color}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    branding: { ...prev.branding, secondary_color: e.target.value }
                  }))}
                  placeholder="#00A9EE"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="accent_color">Accent Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="accent_color"
                  value={settings.branding.accent_color}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    branding: { ...prev.branding, accent_color: e.target.value }
                  }))}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <Input
                  value={settings.branding.accent_color}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    branding: { ...prev.branding, accent_color: e.target.value }
                  }))}
                  placeholder="#FF6B35"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Default Dashboard Layout</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time_range">Default Time Range</Label>
              <select
                id="time_range"
                value={settings.default_dashboard_layout.time_range}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  default_dashboard_layout: {
                    ...prev.default_dashboard_layout,
                    time_range: e.target.value
                  }
                }))}
                className="w-full p-2 border rounded-md mt-1"
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <div>
              <Label htmlFor="layout_preference">Layout Preference</Label>
              <select
                id="layout_preference"
                value={settings.default_dashboard_layout.layout_preference}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  default_dashboard_layout: {
                    ...prev.default_dashboard_layout,
                    layout_preference: e.target.value
                  }
                }))}
                className="w-full p-2 border rounded-md mt-1"
              >
                <option value="grid">Grid Layout</option>
                <option value="list">List Layout</option>
                <option value="compact">Compact Layout</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Default KPIs to Display</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {kpiOptions.map((kpi) => (
                <Badge
                  key={kpi.value}
                  variant={settings.default_dashboard_layout.default_kpis.includes(kpi.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleKpiToggle(kpi.value)}
                >
                  {kpi.label}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Click to toggle KPIs that appear by default on the dashboard
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
