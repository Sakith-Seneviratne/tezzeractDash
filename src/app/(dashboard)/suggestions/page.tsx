"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RefreshCw, Plus, Edit, Calendar, Save, X } from 'lucide-react';
import { useLLM } from '@/hooks/use-llm';
import { ContentSuggestion } from '@/lib/llm/types';
import { useAuth } from '@/contexts/auth-context';

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<ContentSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const { generateContentSuggestions, loading: llmLoading, error } = useLLM();
  const { selectedOrganization } = useAuth();

  const handleGenerateSuggestions = async () => {
    setLoading(true);
    
    // Mock analytics data - in real app, this would come from your database
    const mockAnalyticsData = {
      impressions: 125000,
      reach: 45000,
      engagement: 3200,
      clicks: 850,
      conversions: 45,
      platforms: {
        facebook: { impressions: 45000, engagement: 1200 },
        instagram: { impressions: 35000, engagement: 1800 },
        linkedin: { impressions: 25000, engagement: 800 },
      }
    };

    const mockObjectives = [
      { type: 'monthly', description: 'Increase brand awareness by 20%', target_metrics: { reach: 50000 } },
      { type: 'quarterly', description: 'Generate 100 qualified leads', target_metrics: { conversions: 100 } }
    ];

    const mockCompetitorData = [
      { name: 'Competitor A', platform: 'linkedin', url: 'https://linkedin.com/company/competitor-a' },
      { name: 'Competitor B', platform: 'instagram', url: 'https://instagram.com/competitor-b' }
    ];

    try {
      const newSuggestions = await generateContentSuggestions(
        mockAnalyticsData,
        mockObjectives,
        mockCompetitorData
      );
      
      if (newSuggestions.length > 0) {
        setSuggestions(newSuggestions);
      } else {
        // Fallback to mock suggestions if LLM fails
        setSuggestions([
          {
            postingDate: '2024-01-15',
            title: '5 Tips for Better Engagement',
            platform: 'linkedin',
            contentType: 'article',
            objective: 'brand_awareness',
            contentPillar: 'educational',
            description: 'Share actionable tips for improving social media engagement',
            creativeGuidance: 'Use a clean, professional design with numbered points',
            caption: 'Looking to boost your social media engagement? Here are 5 proven strategies that actually work! 💡 #SocialMediaTips #Engagement',
            hashtags: ['#SocialMediaTips', '#Engagement', '#DigitalMarketing']
          },
          {
            postingDate: '2024-01-16',
            title: 'Behind the Scenes: Our Creative Process',
            platform: 'instagram',
            contentType: 'video',
            objective: 'engagement',
            contentPillar: 'entertainment',
            description: 'Show the creative process behind our latest campaign',
            creativeGuidance: 'Use time-lapse video with upbeat music',
            caption: 'Ever wondered how we bring our ideas to life? Here&apos;s a peek behind the curtain! ✨ #BehindTheScenes #CreativeProcess',
            hashtags: ['#BehindTheScenes', '#CreativeProcess', '#TeamWork']
          }
        ]);
      }
    } catch (err) {
      console.error('Error generating suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingData({ ...suggestions[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingData) {
      const newSuggestions = [...suggestions];
      newSuggestions[editingIndex] = editingData;
      setSuggestions(newSuggestions);
      setEditingIndex(null);
      setEditingData(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingData(null);
  };

  const handleAddToCalendar = (suggestion: ContentSuggestion) => {
    // In a real app, this would add to the content calendar
    console.log('Adding to calendar:', suggestion);
    // You could show a toast notification here
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      facebook: 'bg-blue-600',
      instagram: 'bg-pink-600',
      linkedin: 'bg-blue-700',
      twitter: 'bg-blue-500',
    };
    return colors[platform as keyof typeof colors] || 'bg-gray-600';
  };

  const getContentTypeColor = (type: string) => {
    const colors = {
      post: 'bg-green-100 text-green-800',
      video: 'bg-purple-100 text-purple-800',
      article: 'bg-blue-100 text-blue-800',
      carousel: 'bg-orange-100 text-orange-800',
      story: 'bg-pink-100 text-pink-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Content Suggestions</h1>
          <p className="text-muted-foreground">
            AI-powered content ideas based on your data and objectives
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleGenerateSuggestions}
            disabled={loading || llmLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(loading || llmLoading) ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
          <Button 
            className="gradient-primary"
            onClick={handleGenerateSuggestions}
            disabled={loading || llmLoading}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Generate New Ideas
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Content Suggestions</CardTitle>
          <CardDescription>
            Review and customize AI-generated content ideas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-4">
                  {editingIndex === index ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={editingData?.title || ''}
                            onChange={(e) => setEditingData(prev => prev ? { ...prev, title: e.target.value } : null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="platform">Platform</Label>
                          <Input
                            id="platform"
                            value={editingData?.platform || ''}
                            onChange={(e) => setEditingData(prev => prev ? { ...prev, platform: e.target.value } : null)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="caption">Caption</Label>
                        <Input
                          id="caption"
                          value={editingData?.caption || ''}
                          onChange={(e) => setEditingData(prev => prev ? { ...prev, caption: e.target.value } : null)}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <div className="text-sm font-medium">{suggestion.postingDate}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm font-medium">{suggestion.title}</div>
                      </div>
                      <div className="col-span-1">
                        <Badge className={`${getPlatformColor(suggestion.platform)} text-white`}>
                          {suggestion.platform}
                        </Badge>
                      </div>
                      <div className="col-span-1">
                        <Badge className={getContentTypeColor(suggestion.contentType)}>
                          {suggestion.contentType}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm">{suggestion.objective}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm">{suggestion.contentPillar}</div>
                      </div>
                      <div className="col-span-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="col-span-1">
                        <Button 
                          size="sm" 
                          className="gradient-primary"
                          onClick={() => handleAddToCalendar(suggestion)}
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No content suggestions yet. Click &quot;Generate New Ideas&quot; to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
