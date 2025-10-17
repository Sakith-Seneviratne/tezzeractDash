"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Calendar, Target, Users, TrendingUp, Sparkles, X, Plus } from 'lucide-react';

interface ContentSuggestion {
  id: string;
  title: string;
  platform: string;
  content_type: string;
  objective: string;
  content_pillar: string;
  description: string;
  creative_guidance: string;
  caption: string;
  hashtags: string[];
  posting_date: string;
}

interface OrganizationData {
  name: string;
  type: string;
  products_services: string;
  objectives: string;
  website_url: string;
}

interface Objective {
  id: string;
  type: string;
  description: string;
  target_impressions: number;
  target_reach: number;
}

export function ContentSuggestions() {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(false);

  // Load organization data and objectives from localStorage
  useEffect(() => {
    const savedOrgData = localStorage.getItem('organization_data');
    const savedObjectives = localStorage.getItem('organization_objectives');
    const savedSuggestions = localStorage.getItem('content_suggestions');

    if (savedOrgData) {
      try {
        setOrganizationData(JSON.parse(savedOrgData));
      } catch (error) {
        console.error('Error parsing organization data:', error);
      }
    }

    if (savedObjectives) {
      try {
        setObjectives(JSON.parse(savedObjectives));
      } catch (error) {
        console.error('Error parsing objectives:', error);
      }
    }

    if (savedSuggestions) {
      try {
        setSuggestions(JSON.parse(savedSuggestions));
      } catch (error) {
        console.error('Error parsing suggestions:', error);
      }
    }
  }, []);

  // Hardcoded suggestions for now (will be replaced with LLM-generated content)
  const hardcodedSuggestions: ContentSuggestion[] = [
    {
      id: '1',
      title: 'Product Showcase Video',
      platform: 'Instagram',
      content_type: 'Video',
      objective: 'Brand Awareness',
      content_pillar: 'Product Education',
      description: 'Create an engaging video showcasing your main product features and benefits',
      creative_guidance: 'Use bright lighting, show product in action, include customer testimonials',
      caption: '🚀 Introducing our latest innovation! See how it can transform your daily routine. #ProductLaunch #Innovation',
      hashtags: ['#ProductLaunch', '#Innovation', '#Tech', '#Lifestyle'],
      posting_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 days from now
    },
    {
      id: '2',
      title: 'Behind-the-Scenes Story',
      platform: 'Facebook',
      content_type: 'Story',
      objective: 'Engagement',
      content_pillar: 'Company Culture',
      description: 'Share a behind-the-scenes look at your team and company culture',
      creative_guidance: 'Show team members working, office environment, company values in action',
      caption: 'Meet the amazing team behind our success! 💪 Every great product starts with great people. #TeamWork #CompanyCulture',
      hashtags: ['#TeamWork', '#CompanyCulture', '#BehindTheScenes', '#WorkLife'],
      posting_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days from now
    }
  ];

  const generateContentSuggestions = async () => {
    setLoading(true);
    
    try {
      console.log('Generating content suggestions...');
      console.log('Organization data:', organizationData);
      console.log('Objectives:', objectives);

      // Call the API to generate suggestions
      const response = await fetch('/api/llm/content-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationData,
          objectives
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate suggestions');
      }

      console.log('API response:', data);

      // Add new suggestions to existing ones
      setSuggestions(prev => [...prev, ...data.suggestions]);
      
      // Save to localStorage
      const updatedSuggestions = [...suggestions, ...data.suggestions];
      localStorage.setItem('content_suggestions', JSON.stringify(updatedSuggestions));
      
      console.log('Content suggestions generated successfully!');
      
      // Show success message based on generation method
      if (data.generated_by === 'gemini') {
        alert(`✅ AI-generated ${data.suggestions.length} personalized content suggestions!\n\n🤖 Generated by: Gemini AI\n🏢 Organization: ${data.organization_context.name}\n🌐 Website analyzed: ${data.website_content_used ? 'Yes' : 'No'}`);
      } else {
        alert(`✅ Generated ${data.suggestions.length} content suggestions!\n\n📝 Using: ${data.generated_by === 'fallback' ? 'Fallback suggestions' : 'Hardcoded examples'}`);
      }
      
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback to hardcoded suggestions if API fails
      const newSuggestions = hardcodedSuggestions.map(suggestion => ({
        ...suggestion,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }));

      setSuggestions(prev => [...prev, ...newSuggestions]);
      
      // Save to localStorage
      localStorage.setItem('content_suggestions', JSON.stringify([...suggestions, ...newSuggestions]));
    } finally {
      setLoading(false);
    }
  };

  const removeSuggestion = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion && confirm(`Are you sure you want to remove "${suggestion.title}"?`)) {
      const updatedSuggestions = suggestions.filter(s => s.id !== suggestionId);
      setSuggestions(updatedSuggestions);
      localStorage.setItem('content_suggestions', JSON.stringify(updatedSuggestions));
    }
  };

  const addToCalendar = (suggestion: ContentSuggestion) => {
    try {
      const calendarEvent = {
        title: suggestion.title,
        date: suggestion.posting_date,
        platform: suggestion.platform,
        description: suggestion.description,
        caption: suggestion.caption,
        hashtags: suggestion.hashtags,
        creative_guidance: suggestion.creative_guidance,
        content_type: suggestion.content_type,
        objective: suggestion.objective,
        content_pillar: suggestion.content_pillar
      };

      // Save to calendar (localStorage for now)
      const existingCalendar = JSON.parse(localStorage.getItem('content_calendar') || '[]');
      const calendarItem = {
        id: Date.now().toString(),
        ...calendarEvent,
        suggestion_id: suggestion.id,
        status: 'scheduled',
        created_at: new Date().toISOString()
      };
      
      existingCalendar.push(calendarItem);
      localStorage.setItem('content_calendar', JSON.stringify(existingCalendar));
      
      // Show success message
      alert(`✅ Added "${suggestion.title}" to your content calendar!\n\n📅 Scheduled for: ${new Date(suggestion.posting_date).toLocaleDateString()}\n📱 Platform: ${suggestion.platform}\n🎯 Objective: ${suggestion.objective}`);
    } catch (error) {
      console.error('Error adding to calendar:', error);
      alert('❌ Failed to add to calendar. Please try again.');
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'facebook': return 'bg-blue-600';
      case 'twitter': return 'bg-black';
      case 'linkedin': return 'bg-blue-700';
      default: return 'bg-gray-600';
    }
  };

  const getObjectiveColor = (objective: string) => {
    switch (objective.toLowerCase()) {
      case 'brand awareness': return 'bg-green-100 text-green-800';
      case 'engagement': return 'bg-blue-100 text-blue-800';
      case 'lead generation': return 'bg-purple-100 text-purple-800';
      case 'sales': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">AI Content Suggestions</h2>
        <p className="text-muted-foreground">
          Generate personalized content suggestions based on your organization and objectives
        </p>
      </div>

      {/* Organization Info */}
      {organizationData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Organization Context</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">{organizationData.name}</h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {organizationData.type?.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {objectives.length} objectives defined
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Suggestions Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-medium">Generate Content Suggestions</h3>
            </div>
            <p className="text-muted-foreground">
              AI will create personalized content suggestions based on your organization data and objectives
            </p>
            <Button 
              onClick={generateContentSuggestions}
              disabled={loading || !organizationData || objectives.length === 0}
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate Suggestions
                </>
              )}
            </Button>
            {!organizationData && (
              <p className="text-sm text-destructive">
                Please complete organization setup first
              </p>
            )}
            {organizationData && objectives.length === 0 && (
              <p className="text-sm text-destructive">
                Please add some business objectives first
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Suggestions ({suggestions.length})</CardTitle>
                <CardDescription>
                  AI-generated content suggestions tailored to your business
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all suggestions?')) {
                    setSuggestions([]);
                    localStorage.removeItem('content_suggestions');
                  }
                }}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border rounded-lg p-6 space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-lg">{suggestion.title}</h4>
                        <Badge className={getPlatformColor(suggestion.platform)}>
                          {suggestion.platform}
                        </Badge>
                        <Badge variant="outline">{suggestion.content_type}</Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Post on {new Date(suggestion.posting_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToCalendar(suggestion)}
                        className="flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add to Calendar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSuggestion(suggestion.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Objective and Pillar */}
                  <div className="flex items-center space-x-4">
                    <Badge className={getObjectiveColor(suggestion.objective)}>
                      <Target className="h-3 w-3 mr-1" />
                      {suggestion.objective}
                    </Badge>
                    <Badge variant="secondary">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {suggestion.content_pillar}
                    </Badge>
                  </div>

                  {/* Description */}
                  <div>
                    <h5 className="font-medium mb-2">Description</h5>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                  </div>

                  {/* Creative Guidance */}
                  <div>
                    <h5 className="font-medium mb-2">Creative Guidance</h5>
                    <p className="text-sm text-muted-foreground">{suggestion.creative_guidance}</p>
                  </div>

                  {/* Caption */}
                  <div>
                    <h5 className="font-medium mb-2">Suggested Caption</h5>
                    <div className="bg-accent p-3 rounded-lg">
                      <p className="text-sm">{suggestion.caption}</p>
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <h5 className="font-medium mb-2">Hashtags</h5>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.hashtags.map((hashtag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {hashtag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {suggestions.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Suggestions Yet</h3>
            <p className="text-muted-foreground">
              Generate your first AI-powered content suggestions to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
