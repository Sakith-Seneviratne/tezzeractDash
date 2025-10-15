"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, Building2, Shield, Plug, Brain, Users } from 'lucide-react';
import { UserSettings } from '@/components/settings/user-settings';
import { OrganizationSettings } from '@/components/settings/organization-settings';
import { OrganizationAccess } from '@/components/settings/organization-access';
import { IntegrationSettings } from '@/components/settings/integration-settings';
import { LLMSettings } from '@/components/settings/llm-settings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('user');

  const tabs = [
    { id: 'user', label: 'User Settings', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'access', label: 'Access Control', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'llm', label: 'AI Settings', icon: Brain },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, organization, and integrations
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
        {activeTab === 'user' && <UserSettings />}
        {activeTab === 'organization' && <OrganizationSettings />}
        {activeTab === 'access' && <OrganizationAccess />}
        {activeTab === 'integrations' && <IntegrationSettings />}
        {activeTab === 'llm' && <LLMSettings />}
      </div>
    </div>
  );
}
