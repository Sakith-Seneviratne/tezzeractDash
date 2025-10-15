"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plug, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Settings,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';

interface Integration {
  id: string;
  platform_type: string;
  name: string;
  status: 'connected' | 'error' | 'pending';
  last_synced_at?: string;
  config: Record<string, any>;
}

export function IntegrationSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { selectedOrganization } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (selectedOrganization) {
      fetchIntegrations();
    }
  }, [selectedOrganization]);

  const fetchIntegrations = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('data_streams')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching integrations:', error);
        return;
      }

      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId);
    try {
      const response = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integrationId,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchIntegrations();
        console.log('Sync completed successfully');
      } else {
        console.error('Sync failed:', result.error);
      }
    } catch (error) {
      console.error('Error syncing integration:', error);
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;

    try {
      const { error } = await supabase
        .from('data_streams')
        .delete()
        .eq('id', integrationId);

      if (error) {
        console.error('Error disconnecting integration:', error);
        return;
      }

      await fetchIntegrations();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
    }
  };

  const handleConnect = (platform: string) => {
    // In a real app, this would initiate OAuth flow
    console.log('Connecting to platform:', platform);
    // For now, we'll just show a message
    alert(`Connecting to ${platform}... (OAuth flow would be implemented here)`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Not Connected
          </Badge>
        );
    }
  };

  const getPlatformIcon = (platform: string) => {
    // In a real app, you would have proper icons for each platform
    return <Plug className="h-5 w-5" />;
  };

  const availablePlatforms = [
    { id: 'facebook', name: 'Facebook & Instagram', description: 'Meta Business Suite' },
    { id: 'linkedin', name: 'LinkedIn', description: 'Company Page Analytics' },
    { id: 'google_analytics', name: 'Google Analytics', description: 'Website Analytics' },
    { id: 'google_ads', name: 'Google Ads', description: 'Advertising Campaigns' },
    { id: 'twitter', name: 'Twitter', description: 'Tweet Analytics' },
    { id: 'tiktok', name: 'TikTok', description: 'Video Analytics' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plug className="h-5 w-5" />
          <span>Integration Settings</span>
        </CardTitle>
        <CardDescription>
          Manage your connected platforms and data sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connected Integrations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Connected Integrations</h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading integrations...</p>
            </div>
          ) : integrations.length > 0 ? (
            <div className="space-y-3">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getPlatformIcon(integration.platform_type)}
                    <div>
                      <div className="font-medium">{integration.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {integration.last_synced_at 
                          ? `Last synced: ${new Date(integration.last_synced_at).toLocaleDateString()}`
                          : 'Never synced'
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(integration.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(integration.id)}
                      disabled={syncing === integration.id}
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${syncing === integration.id ? 'animate-spin' : ''}`} />
                      {syncing === integration.id ? 'Syncing...' : 'Sync'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Plug className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No integrations connected yet.</p>
            </div>
          )}
        </div>

        {/* Available Platforms */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Available Platforms</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePlatforms.map((platform) => {
              const isConnected = integrations.some(i => i.platform_type === platform.id);
              
              return (
                <div key={platform.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getPlatformIcon(platform.id)}
                      <div>
                        <h4 className="font-medium">{platform.name}</h4>
                        <p className="text-sm text-muted-foreground">{platform.description}</p>
                      </div>
                    </div>
                    {isConnected ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(platform.id)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sync Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Sync Settings</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Automatic Sync</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Data is automatically synced every 24 hours
              </p>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3 mr-1" />
                Configure Schedule
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Manual Sync</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Force sync all connected platforms now
              </p>
              <Button size="sm" variant="outline">
                <RefreshCw className="h-3 w-3 mr-1" />
                Sync All Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
