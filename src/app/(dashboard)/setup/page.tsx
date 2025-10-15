"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plug, Target, Users, Upload, CheckCircle, AlertCircle, Facebook, Linkedin, BarChart3, DollarSign } from 'lucide-react';
import { PlatformConnectionCard } from '@/components/setup/platform-connection-card';
import { ObjectivesManager } from '@/components/setup/objectives-manager';
import { CompetitorManager } from '@/components/setup/competitor-manager';
import { CsvUpload } from '@/components/setup/csv-upload';
import { useAuth } from '@/contexts/auth-context';

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState('connections');
  const { selectedOrganization } = useAuth();

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook & Instagram',
      description: 'Meta Business Suite',
      icon: Facebook,
      color: 'bg-blue-600',
      connected: false,
      status: 'pending' as const,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Company Page Analytics',
      icon: Linkedin,
      color: 'bg-blue-700',
      connected: false,
      status: 'pending' as const,
    },
    {
      id: 'google_analytics',
      name: 'Google Analytics',
      description: 'Website Analytics',
      icon: BarChart3,
      color: 'bg-orange-600',
      connected: false,
      status: 'pending' as const,
    },
    {
      id: 'google_ads',
      name: 'Google Ads',
      description: 'Advertising Campaigns',
      icon: DollarSign,
      color: 'bg-green-600',
      connected: false,
      status: 'pending' as const,
    },
  ];

  const tabs = [
    { id: 'connections', label: 'Platform Connections', icon: Plug },
    { id: 'objectives', label: 'Objectives', icon: Target },
    { id: 'competitors', label: 'Competitors', icon: Users },
    { id: 'csv', label: 'CSV Upload', icon: Upload },
  ];

  const handleConnect = async (platformId: string) => {
    try {
      // Get OAuth URL for the platform
      const response = await fetch(`/api/integrations/oauth-url?platform=${platformId}`);
      const data = await response.json();
      
      if (data.oauthUrl) {
        // Redirect to OAuth flow
        window.location.href = data.oauthUrl;
      } else {
        console.error('Failed to get OAuth URL:', data.error);
      }
    } catch (error) {
      console.error('Error initiating OAuth flow:', error);
    }
  };

  const handleDisconnect = (platformId: string) => {
    console.log('Disconnecting from platform:', platformId);
    // In a real app, this would revoke tokens
  };

  const handleTestConnection = (platformId: string) => {
    console.log('Testing connection for platform:', platformId);
    // In a real app, this would test the API connection
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Digital Setup</h1>
        <p className="text-muted-foreground">
          Connect your platforms and configure your objectives
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'connections' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Platform Connections</h2>
                <p className="text-muted-foreground">
                  Connect your social media and analytics platforms
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {platforms.filter(p => p.connected).length} Connected
                </Badge>
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {platforms.filter(p => !p.connected).length} Pending
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platforms.map((platform) => (
                <PlatformConnectionCard
                  key={platform.id}
                  platform={platform}
                  onConnect={() => handleConnect(platform.id)}
                  onDisconnect={() => handleDisconnect(platform.id)}
                  onTestConnection={() => handleTestConnection(platform.id)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'objectives' && (
          <ObjectivesManager />
        )}

        {activeTab === 'competitors' && (
          <CompetitorManager />
        )}

        {activeTab === 'csv' && (
          <CsvUpload />
        )}
      </div>
    </div>
  );
}
