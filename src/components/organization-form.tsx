"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { generateSlug } from '@/lib/utils';

// Simple select component
const Select = ({ value, onChange, children, ...props }: any) => (
  <select
    value={value}
    onChange={onChange}
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  >
    {children}
  </select>
);

export function OrganizationForm() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [productsServices, setProductsServices] = useState('');
  const [objectives, setObjectives] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingOrganization, setExistingOrganization] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { user, refreshOrganizations } = useAuth();

  // Load existing organization data on component mount
  useEffect(() => {
    const savedOrgData = localStorage.getItem('organization_data');
    if (savedOrgData) {
      try {
        const orgData = JSON.parse(savedOrgData);
        setExistingOrganization(orgData);
        setName(orgData.name);
        setType(orgData.type);
        setProductsServices(orgData.products_services);
        setObjectives(orgData.objectives);
        setWebsiteUrl(orgData.website_url);
        setIsEditing(true);
      } catch (error) {
        console.error('Error parsing saved organization data:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', { name, type, productsServices, objectives, websiteUrl });
    
    setLoading(true);
    setError('');

    try {
      const slug = generateSlug(name);
      console.log('Generated slug:', slug);
      
      // Store organization data in localStorage
      const organizationData = {
        id: existingOrganization?.id || Date.now().toString(), // Keep existing ID or generate new
        name,
        slug,
        type,
        products_services: productsServices,
        objectives,
        website_url: websiteUrl,
        created_at: existingOrganization?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        settings: {}
      };

      console.log('Storing organization data:', organizationData);
      
      // Save to localStorage
      localStorage.setItem('organization_data', JSON.stringify(organizationData));
      
      console.log('Organization data saved to localStorage successfully!');
      
      const action = isEditing ? 'updated' : 'created';
      alert(`Organization ${action} successfully!`);
      
      // Update local state
      setExistingOrganization(organizationData);
      setIsEditing(true);
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gradient">
          {isEditing ? 'Organization Profile' : 'Create Organization'}
        </CardTitle>
        <CardDescription>
          {isEditing ? 'Update your organization profile' : 'Set up your organization profile to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter organization name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Organization Type *</Label>
              <Select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="">Select organization type</option>
                <option value="startup">Startup</option>
                <option value="small_business">Small Business</option>
                <option value="medium_business">Medium Business</option>
                <option value="enterprise">Enterprise</option>
                <option value="non_profit">Non-Profit</option>
                <option value="agency">Agency</option>
                <option value="freelancer">Freelancer</option>
                <option value="other">Other</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://your-website.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="products">Products/Services *</Label>
            <textarea
              id="products"
              placeholder="Describe what your organization offers..."
              value={productsServices}
              onChange={(e) => setProductsServices(e.target.value)}
              required
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectives">Organization Objectives *</Label>
            <textarea
              id="objectives"
              placeholder="What are your main business objectives and goals?"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              required
              rows={4}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full gradient-primary" 
              disabled={loading}
            >
              {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Organization' : 'Create Organization')}
            </Button>
            
            {isEditing && (
              <Button 
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (confirm('Are you sure you want to create a new organization? This will replace your current organization data.')) {
                    // Clear form
                    setName('');
                    setType('');
                    setProductsServices('');
                    setObjectives('');
                    setWebsiteUrl('');
                    setExistingOrganization(null);
                    setIsEditing(false);
                  }
                }}
              >
                Create New Organization
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
