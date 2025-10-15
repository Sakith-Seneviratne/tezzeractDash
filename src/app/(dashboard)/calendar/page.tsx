"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Table, Grid, CalendarDays } from 'lucide-react';
import { CalendarView } from '@/components/calendar/calendar-view';
import { TableView } from '@/components/calendar/table-view';
import { ContentDetailModal } from '@/components/calendar/content-detail-modal';
import { ContentCalendar } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [contentItems, setContentItems] = useState<ContentCalendar[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentCalendar | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { selectedOrganization } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (selectedOrganization) {
      fetchContentItems();
    }
  }, [selectedOrganization]);

  const fetchContentItems = async () => {
    if (!selectedOrganization) return;

    try {
      const { data, error } = await supabase
        .from('content_calendar')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('posting_date', { ascending: true });

      if (error) {
        console.error('Error fetching content items:', error);
        return;
      }

      setContentItems(data || []);
    } catch (error) {
      console.error('Error fetching content items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = () => {
    setSelectedContent(null);
    setIsModalOpen(true);
  };

  const handleEditContent = (content: ContentCalendar) => {
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const handleSaveContent = async (content: ContentCalendar) => {
    if (!selectedOrganization) return;

    try {
      if (content.id) {
        // Update existing content
        const { error } = await supabase
          .from('content_calendar')
          .update({
            ...content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', content.id);

        if (error) {
          console.error('Error updating content:', error);
          return;
        }
      } else {
        // Create new content
        const { error } = await supabase
          .from('content_calendar')
          .insert({
            ...content,
            organization_id: selectedOrganization.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error creating content:', error);
          return;
        }
      }

      await fetchContentItems();
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_calendar')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting content:', error);
        return;
      }

      await fetchContentItems();
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const getStats = () => {
    const scheduled = contentItems.filter(item => item.status === 'scheduled').length;
    const published = contentItems.filter(item => item.status === 'published').length;
    const draft = contentItems.filter(item => item.status === 'draft').length;
    const cancelled = contentItems.filter(item => item.status === 'cancelled').length;

    return { scheduled, published, draft, cancelled };
  };

  const getPlatformStats = () => {
    const platforms = contentItems.reduce((acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return platforms;
  };

  const stats = getStats();
  const platformStats = getPlatformStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Content Calendar</h1>
          <p className="text-muted-foreground">
            Plan and manage your content schedule
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            <Table className="h-4 w-4 mr-2" />
            Table View
          </Button>
          <Button 
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button className="gradient-primary" onClick={handleAddContent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading content...</p>
                </div>
              </CardContent>
            </Card>
          ) : viewMode === 'calendar' ? (
            <CalendarView
              contentItems={contentItems}
              onAddContent={handleAddContent}
              onEditContent={handleEditContent}
              onDeleteContent={handleDeleteContent}
            />
          ) : (
            <TableView
              contentItems={contentItems}
              onAddContent={handleAddContent}
              onEditContent={handleEditContent}
              onDeleteContent={handleDeleteContent}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Scheduled</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {stats.scheduled}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Published</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {stats.published}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Draft</span>
                  <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    {stats.draft}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cancelled</span>
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    {stats.cancelled}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(platformStats).map(([platform, count]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        platform === 'facebook' ? 'bg-blue-600' :
                        platform === 'instagram' ? 'bg-pink-500' :
                        platform === 'linkedin' ? 'bg-blue-500' :
                        platform === 'twitter' ? 'bg-blue-400' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-sm capitalize">{platform.replace('_', ' ')}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contentItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="text-sm">
                    <div className="font-medium truncate">{item.title}</div>
                    <div className="text-muted-foreground">
                      {new Date(item.posting_date).toLocaleDateString()} • {item.platform}
                    </div>
                  </div>
                ))}
                {contentItems.length === 0 && (
                  <p className="text-sm text-muted-foreground">No content yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Detail Modal */}
      <ContentDetailModal
        content={selectedContent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContent}
        onDelete={handleDeleteContent}
      />
    </div>
  );
}
