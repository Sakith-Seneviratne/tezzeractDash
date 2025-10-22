"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Settings, 
  Building2, 
  Target, 
  Lightbulb,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react';
import { PlatformConnectionCard } from '@/components/setup/platform-connection-card';
import { OrganizationForm } from '@/components/organization-form';
import { ObjectivesManager } from '@/components/setup/objectives-manager';
import { ContentSuggestions } from '@/components/setup/content-suggestions';

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState('platforms');
  const [googleProperties, setGoogleProperties] = useState<any[]>([]);

  const fetchGoogleProperties = async () => {
    try {
      const response = await fetch('/api/integrations/google-analytics/properties');
      if (response.ok) {
        const data = await response.json();
        setGoogleProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching Google properties:', error);
    }
  };

  useEffect(() => {
    fetchGoogleProperties();
  }, []);

  const tabs = [
    { id: 'platforms', label: 'Platform Connections', icon: BarChart3 },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'objectives', label: 'Objectives', icon: Target },
    { id: 'suggestions', label: 'Content Suggestions', icon: Lightbulb },
  ];

  const platforms = [
    {
      id: 'google_analytics',
      name: 'Google Analytics',
      description: 'Track website traffic and user behavior',
      icon: BarChart3,
      color: 'bg-blue-500',
      connected: false,
      status: 'disconnected',
    },
    {
      id: 'facebook',
      name: 'Meta (Facebook & Instagram)',
      description: 'Manage Facebook and Instagram content',
      icon: Users,
      color: 'bg-blue-600',
      connected: false,
      status: 'disconnected',
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      description: 'Track Twitter engagement and metrics',
      icon: Users,
      color: 'bg-black',
      connected: false,
      status: 'disconnected',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'platforms':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Platforms</h2>
              <p className="text-gray-600">
                Connect your social media and analytics platforms to start tracking performance.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {platforms.map((platform) => (
                <PlatformConnectionCard
                  key={platform.id}
                  platform={platform}
                  onConnect={async () => {
                    try {
                      const response = await fetch(`/api/integrations/oauth-url?platform=${platform.id}`);
                      if (response.ok) {
                        const data = await response.json();
                        window.location.href = data.oauthUrl;
                      } else {
                        console.error('Failed to get OAuth URL:', await response.text());
                      }
                    } catch (error) {
                      console.error('Error connecting to platform:', error);
                    }
                  }}
                  onDisconnect={() => {
                    console.log(`Disconnecting from ${platform.name}`);
                  }}
                  onTestConnection={() => {
                    console.log(`Testing connection to ${platform.name}`);
                  }}
                />
              ))}
            </div>

            {googleProperties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Google Analytics Properties</CardTitle>
                  <CardDescription>
                    Select which Google Analytics property to use for data collection.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {googleProperties.map((property: any) => (
                      <div key={property.propertyId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{property.displayName}</p>
                          <p className="text-sm text-gray-500">{property.accountName}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Setup</h2>
              <p className="text-gray-600">
                Set up your organization details to personalize content suggestions.
              </p>
            </div>
            <OrganizationForm />
          </div>
        );

      case 'objectives':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Objectives</h2>
              <p className="text-gray-600">
                Define your content marketing objectives to get better AI suggestions.
              </p>
            </div>
            <ObjectivesManager />
          </div>
        );

      case 'suggestions':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Content Suggestions</h2>
              <p className="text-gray-600">
                Get personalized content suggestions based on your organization and objectives.
              </p>
            </div>
            <ContentSuggestions />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup</h1>
          <p className="text-gray-600">
            Complete your setup to start using the dashboard effectively.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}