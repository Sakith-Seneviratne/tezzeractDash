"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Key, 
  Settings,
  Save,
  TestTube,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { LLMProviderType } from '@/lib/llm/llm-service';

interface LLMSettings {
  default_provider: LLMProviderType;
  providers: {
    openai: {
      api_key: string;
      model: string;
      temperature: number;
      max_tokens: number;
      enabled: boolean;
    };
    anthropic: {
      api_key: string;
      model: string;
      temperature: number;
      max_tokens: number;
      enabled: boolean;
    };
    google: {
      api_key: string;
      model: string;
      temperature: number;
      max_tokens: number;
      enabled: boolean;
    };
  };
}

export function LLMSettings() {
  const [settings, setSettings] = useState<LLMSettings>({
    default_provider: 'openai',
    providers: {
      openai: {
        api_key: '',
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2000,
        enabled: false,
      },
      anthropic: {
        api_key: '',
        model: 'claude-3-sonnet-20240229',
        temperature: 0.7,
        max_tokens: 2000,
        enabled: false,
      },
      google: {
        api_key: '',
        model: 'gemini-pro',
        temperature: 0.7,
        max_tokens: 2000,
        enabled: false,
      },
    },
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const { selectedOrganization } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (selectedOrganization) {
      fetchSettings();
    }
  }, [selectedOrganization]);

  const fetchSettings = async () => {
    if (!selectedOrganization) return;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', selectedOrganization.id)
        .single();

      if (error) {
        console.error('Error fetching LLM settings:', error);
        return;
      }

      if (data?.settings?.llm) {
        setSettings(data.settings.llm);
      }
    } catch (error) {
      console.error('Error fetching LLM settings:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedOrganization) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          settings: {
            llm: settings,
          },
        })
        .eq('id', selectedOrganization.id);

      if (error) {
        console.error('Error saving LLM settings:', error);
        return;
      }

      console.log('LLM settings saved successfully');
    } catch (error) {
      console.error('Error saving LLM settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestProvider = async (provider: LLMProviderType) => {
    setTesting(provider);
    try {
      const response = await fetch('/api/llm/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          settings: settings.providers[provider],
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`${provider.toUpperCase()} connection successful!`);
      } else {
        alert(`Failed to connect to ${provider.toUpperCase()}: ${result.error}`);
      }
    } catch (error) {
      alert(`Error testing ${provider.toUpperCase()} connection`);
    } finally {
      setTesting(null);
    }
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const updateProviderSetting = (provider: LLMProviderType, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [provider]: {
          ...prev.providers[provider],
          [field]: value,
        },
      },
    }));
  };

  const providerInfo = {
    openai: {
      name: 'OpenAI',
      description: 'GPT-4, GPT-3.5 Turbo',
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    },
    anthropic: {
      name: 'Anthropic',
      description: 'Claude 3 Sonnet, Claude 3 Haiku',
      models: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
    },
    google: {
      name: 'Google AI',
      description: 'Gemini Pro, Gemini Ultra',
      models: ['gemini-pro', 'gemini-pro-vision'],
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>LLM Settings</span>
        </CardTitle>
        <CardDescription>
          Configure AI providers for content generation and insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Provider */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Default Provider</h3>
          <div>
            <Label htmlFor="default_provider">Primary LLM Provider</Label>
            <select
              id="default_provider"
              value={settings.default_provider}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                default_provider: e.target.value as LLMProviderType 
              }))}
              className="w-full p-2 border rounded-md mt-1"
            >
              <option value="openai">OpenAI (GPT-4)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="google">Google AI (Gemini)</option>
            </select>
            <p className="text-sm text-muted-foreground mt-1">
              This provider will be used for content generation and insights by default
            </p>
          </div>
        </div>

        {/* Provider Configurations */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Provider Configurations</h3>
          
          {Object.entries(providerInfo).map(([providerKey, info]) => {
            const provider = providerKey as LLMProviderType;
            const providerSettings = settings.providers[provider];
            
            return (
              <div key={provider} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">{info.name}</h4>
                    <p className="text-sm text-muted-foreground">{info.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={providerSettings.enabled ? "default" : "outline"}
                      className={providerSettings.enabled ? "bg-green-100 text-green-800" : ""}
                    >
                      {providerSettings.enabled ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Disabled
                        </>
                      )}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestProvider(provider)}
                      disabled={testing === provider || !providerSettings.enabled}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      {testing === provider ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${provider}_api_key`}>API Key</Label>
                    <div className="relative">
                      <Input
                        id={`${provider}_api_key`}
                        type={showKeys[provider] ? 'text' : 'password'}
                        value={providerSettings.api_key}
                        onChange={(e) => updateProviderSetting(provider, 'api_key', e.target.value)}
                        placeholder={`Enter ${info.name} API key`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleKeyVisibility(provider)}
                      >
                        {showKeys[provider] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`${provider}_model`}>Model</Label>
                    <select
                      id={`${provider}_model`}
                      value={providerSettings.model}
                      onChange={(e) => updateProviderSetting(provider, 'model', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {info.models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor={`${provider}_temperature`}>
                      Temperature: {providerSettings.temperature}
                    </Label>
                    <input
                      type="range"
                      id={`${provider}_temperature`}
                      min="0"
                      max="2"
                      step="0.1"
                      value={providerSettings.temperature}
                      onChange={(e) => updateProviderSetting(provider, 'temperature', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Lower values = more focused, higher values = more creative
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor={`${provider}_max_tokens`}>Max Tokens</Label>
                    <Input
                      id={`${provider}_max_tokens`}
                      type="number"
                      value={providerSettings.max_tokens}
                      onChange={(e) => updateProviderSetting(provider, 'max_tokens', parseInt(e.target.value))}
                      min="100"
                      max="4000"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={providerSettings.enabled}
                      onChange={(e) => updateProviderSetting(provider, 'enabled', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Enable this provider</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
