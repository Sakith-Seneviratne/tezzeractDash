"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Plug, Target, Users, Upload, CheckCircle, AlertCircle, Facebook, Linkedin, BarChart3, DollarSign, Building2, Lightbulb } from 'lucide-react';
import { PlatformConnectionCard } from '@/components/setup/platform-connection-card';
import { ObjectivesManager } from '@/components/setup/objectives-manager';
import { CompetitorManager } from '@/components/setup/competitor-manager';
import { CsvUpload } from '@/components/setup/csv-upload';
import { OrganizationForm } from '@/components/organization-form';
import { ContentSuggestions } from '@/components/setup/content-suggestions';

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState('connections');
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [metaConnected, setMetaConnected] = useState(false);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [gaProperties, setGaProperties] = useState<Array<{propertyId: string; displayName: string; accountName: string}>>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [tempGoogleTokens, setTempGoogleTokens] = useState<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    user_id?: string;
    user_name?: string;
    user_email?: string;
  } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch Google Analytics properties
  const fetchGoogleProperties = useCallback(async (accessToken: string) => {
    try {
      const response = await fetch(`/api/integrations/google-analytics/properties?access_token=${accessToken}`);
      const data = await response.json();
      
      if (data.success && data.properties.length > 0) {
        setGaProperties(data.properties);
        setSelectedPropertyId(data.properties[0].propertyId); // Default to first property
        setShowPropertySelector(true);
      } else {
        console.error('No properties found:', data.error);
        // Still save the tokens even if no properties found
        if (tempGoogleTokens) {
          localStorage.setItem('google_tokens', JSON.stringify(tempGoogleTokens));
          setGoogleConnected(true);
        }
        router.replace('/setup');
      }
    } catch (error) {
      console.error('Failed to fetch GA properties:', error);
      // Still save the tokens even if fetch fails
      if (tempGoogleTokens) {
        localStorage.setItem('google_tokens', JSON.stringify(tempGoogleTokens));
        setGoogleConnected(true);
      }
      router.replace('/setup');
    }
  }, [tempGoogleTokens, router]);

  // Check if platforms are already connected
  useEffect(() => {
    const twitterTokens = localStorage.getItem('twitter_tokens');
    const googleTokens = localStorage.getItem('google_tokens');
    const metaTokens = localStorage.getItem('meta_tokens');
    
    if (twitterTokens) {
      setTwitterConnected(true);
    }
    if (googleTokens) {
      setGoogleConnected(true);
    }
    if (metaTokens) {
      setMetaConnected(true);
    }
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const success = searchParams.get('success');
    const tokens = searchParams.get('tokens');
    const error = searchParams.get('error');

    if (success === 'twitter_connected' && tokens) {
      try {
        const decodedTokens = JSON.parse(decodeURIComponent(tokens));
        localStorage.setItem('twitter_tokens', JSON.stringify(decodedTokens));
        setTwitterConnected(true);
        
        // Clean up URL
        router.replace('/setup');
        
        alert('Twitter/X connected successfully!');
      } catch (err) {
        console.error('Error parsing Twitter tokens:', err);
      }
    }

    if (success === 'google_connected' && tokens) {
      try {
        const decodedTokens = JSON.parse(decodeURIComponent(tokens));
        // Store tokens temporarily and fetch properties
        setTempGoogleTokens(decodedTokens);
        fetchGoogleProperties(decodedTokens.access_token);
      } catch (err) {
        console.error('Error parsing Google tokens:', err);
      }
    }

    if (success === 'meta_connected' && tokens) {
      try {
        const decodedTokens = JSON.parse(decodeURIComponent(tokens));
        localStorage.setItem('meta_tokens', JSON.stringify(decodedTokens));
        setMetaConnected(true);
        
        // Clean up URL
        router.replace('/setup');
        
        alert('Meta (Facebook & Instagram) connected successfully!');
      } catch (err) {
        console.error('Error parsing Meta tokens:', err);
      }
    }

    if (error) {
      alert(`Connection failed: ${error}`);
      router.replace('/setup');
    }
  }, [searchParams, router, fetchGoogleProperties]);

  // Handle property selection
  const handlePropertySelection = () => {
    if (tempGoogleTokens && selectedPropertyId) {
      const tokensWithProperty = {
        ...tempGoogleTokens,
        propertyId: selectedPropertyId,
      };
      localStorage.setItem('google_tokens', JSON.stringify(tokensWithProperty));
      setGoogleConnected(true);
      setShowPropertySelector(false);
      setTempGoogleTokens(null);
      router.replace('/setup');
    }
  };

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook & Instagram',
      description: 'Meta Business Suite',
      icon: Facebook,
      color: 'bg-blue-600',
      connected: metaConnected,
      status: metaConnected ? ('active' as const) : ('pending' as const),
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      description: 'Social Media Analytics',
      icon: Linkedin, // We'll use the same icon for now, you can change this
      color: 'bg-black',
      connected: twitterConnected,
      status: twitterConnected ? ('active' as const) : ('pending' as const),
    },
    {
      id: 'google_analytics',
      name: 'Google Analytics',
      description: 'Website Analytics',
      icon: BarChart3,
      color: 'bg-orange-600',
      connected: googleConnected,
      status: googleConnected ? ('active' as const) : ('pending' as const),
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
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'objectives', label: 'Objectives', icon: Target },
    { id: 'suggestions', label: 'Content Suggestions', icon: Lightbulb },
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
    if (platformId === 'twitter') {
      localStorage.removeItem('twitter_tokens');
      setTwitterConnected(false);
      alert('Twitter/X disconnected successfully!');
    } else if (platformId === 'google_analytics') {
      localStorage.removeItem('google_tokens');
      setGoogleConnected(false);
      alert('Google Analytics disconnected successfully!');
    } else if (platformId === 'facebook') {
      localStorage.removeItem('meta_tokens');
      setMetaConnected(false);
      alert('Meta (Facebook & Instagram) disconnected successfully!');
    }
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

        {activeTab === 'organization' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Organization Setup</h2>
              <p className="text-muted-foreground">
                Create or configure your organization profile
              </p>
            </div>
            
            <div className="max-w-2xl">
              <OrganizationForm />
            </div>
          </div>
        )}

        {activeTab === 'objectives' && (
          <ObjectivesManager />
        )}

        {activeTab === 'suggestions' && (
          <ContentSuggestions />
        )}

        {activeTab === 'competitors' && (
          <CompetitorManager />
        )}

        {activeTab === 'csv' && (
          <CsvUpload />
        )}
      </div>

      {/* Property Selector Modal */}
      {showPropertySelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Select Google Analytics Property</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You have multiple GA4 properties. Please select which one you want to use for analytics:
            </p>
            
            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {gaProperties.map((property) => (
                <label
                  key={property.propertyId}
                  className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                >
                  <input
                    type="radio"
                    name="property"
                    value={property.propertyId}
                    checked={selectedPropertyId === property.propertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{property.displayName}</div>
                    <div className="text-sm text-muted-foreground">
                      Account: {property.accountName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Property ID: {property.propertyId}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handlePropertySelection}
                disabled={!selectedPropertyId}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Connect Selected Property
              </button>
              <button
                onClick={() => {
                  setShowPropertySelector(false);
                  setTempGoogleTokens(null);
                  router.replace('/setup');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
