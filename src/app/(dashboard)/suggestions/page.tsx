"use client";

import { ContentSuggestions } from '@/components/setup/content-suggestions';

export default function SuggestionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Content Suggestions</h1>
        <p className="text-muted-foreground mt-2">
          Generate personalized content suggestions based on your organization and objectives
        </p>
      </div>
      <ContentSuggestions />
    </div>
  );
}

/* Old implementation - replaced with ContentSuggestions component
export default function OldSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<ContentSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const { generateContentSuggestions, loading: llmLoading, error } = useLLM();

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

  const handleAddToCalendar = async (suggestion: ContentSuggestion) => {
    try {
      // Ensure date is in proper YYYY-MM-DD format
      // Helper function to format date in local timezone (avoids timezone shift)
      const formatDateLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      let formattedDate = suggestion.postingDate;
      if (!formattedDate || formattedDate === '') {
        // If no date, use tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        formattedDate = formatDateLocal(tomorrow);
      } else {
        // Ensure it's in YYYY-MM-DD format
        try {
          const dateObj = new Date(formattedDate);
          formattedDate = formatDateLocal(dateObj);
        } catch {
          formattedDate = formatDateLocal(new Date());
        }
      }

      // Create calendar item from suggestion
      const calendarItem = {
        id: Date.now().toString(),
        title: suggestion.title,
        posting_date: formattedDate,
        platform: suggestion.platform,
        content_type: suggestion.contentType,
        objective: suggestion.objective,
        content_pillar: suggestion.contentPillar,
        description: suggestion.description,
        creative_guidance: suggestion.creativeGuidance,
        caption: suggestion.caption,
        hashtags: suggestion.hashtags,
        attachments: [],
        notes: '',
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Get organization data
      const organizationData = JSON.parse(localStorage.getItem('organization_data') || '{}');
      
      if (!organizationData.id) {
        alert('⚠️ Please create an organization first at /setup/organization');
        return;
      }

      // Save to database first (primary)
      let savedItem = null;
      try {
        console.log('📤 Attempting to save to calendar database...');
        console.log('Organization ID:', organizationData.id);
        console.log('Calendar item:', calendarItem);
        
        const response = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organization_id: organizationData.id,
            title: calendarItem.title,
            posting_date: calendarItem.posting_date,
            platform: calendarItem.platform.toLowerCase(),
            content_type: calendarItem.content_type,
            objective: calendarItem.objective,
            content_pillar: calendarItem.content_pillar,
            description: calendarItem.description,
            creative_guidance: calendarItem.creative_guidance,
            caption: calendarItem.caption,
            hashtags: calendarItem.hashtags || [],
            attachments: [],
            notes: '',
            status: 'scheduled'
          }),
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Database save failed!');
          console.error('Status:', response.status);
          console.error('Error:', errorData);
          alert(`❌ FAILED TO SAVE TO DATABASE!\n\nError: ${errorData.error}\n\nCheck console for details.`);
          throw new Error(errorData.error || 'Failed to save to database');
        }

        const { item } = await response.json();
        savedItem = item;
        console.log('✅ SUCCESS! Saved to calendar database!', item);
        alert(`✅ SAVED TO DATABASE!\n\nID: ${item.id}\n\nCheck Supabase content_calendar table!`);
        
      } catch (dbError) {
        console.error('❌ EXCEPTION during database save!');
        console.error('Error object:', dbError);
        console.error('Error message:', dbError instanceof Error ? dbError.message : String(dbError));
        alert(`❌ EXCEPTION!\n\nError: ${dbError instanceof Error ? dbError.message : String(dbError)}\n\nSaved to localStorage only.\n\nCheck console for full error.`);
        savedItem = calendarItem; // Use local item as fallback
      }

      // Update localStorage with database item or fallback
      const existingCalendar = JSON.parse(localStorage.getItem('content_calendar') || '[]');
      const updatedCalendar = [...existingCalendar, savedItem || calendarItem];
      localStorage.setItem('content_calendar', JSON.stringify(updatedCalendar));

      // Show final success message only if no error alert was shown
      if (savedItem && savedItem.id) {
        const displayDate = formattedDate.split('-').reverse().join('/');
        console.log('✅ All done! Item is in localStorage and database.');
      } else {
        console.warn('⚠️ Item saved to localStorage only, not in database');
      }
      
      console.log('Successfully added to calendar:', calendarItem);
    } catch (error) {
      console.error('Error adding to calendar:', error);
      alert('❌ Failed to add to calendar. Please try again.');
    }
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
*/