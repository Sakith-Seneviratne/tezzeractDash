"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  X,
  Save,
  Trash2,
  Calendar,
  Link,
  Paperclip,
  FileText
} from 'lucide-react';
import { ContentCalendar } from '@/types';

interface ContentDetailModalProps {
  content: ContentCalendar | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: ContentCalendar) => void;
  onDelete: (id: string) => void;
}

export function ContentDetailModal({ 
  content, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}: ContentDetailModalProps) {
  const [formData, setFormData] = useState<Partial<ContentCalendar>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (content) {
      setFormData(content);
    } else {
      setFormData({
        title: '',
        platform: 'facebook',
        content_type: 'post',
        objective: '',
        content_pillar: '',
        description: '',
        creative_guidance: '',
        caption: '',
        hashtags: [],
        attachments: [],
        notes: '',
        status: 'draft',
        posting_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.posting_date) return;

    setLoading(true);
    try {
      await onSave(formData as ContentCalendar);
      onClose();
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!content?.id) return;
    
    if (confirm('Are you sure you want to delete this content?')) {
      await onDelete(content.id);
      onClose();
    }
  };

  const addAttachment = () => {
    setFormData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), { name: '', url: '', type: 'image' }]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || []
    }));
  };

  const updateAttachment = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.map((att, i) => 
        i === index ? { ...att, [field]: value } : att
      ) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {content ? 'Edit Content' : 'Add New Content'}
              </CardTitle>
              <CardDescription>
                {content ? 'Update your content details' : 'Create new content for your calendar'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Content title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="posting_date">Posting Date *</Label>
                <Input
                  id="posting_date"
                  type="date"
                  value={formData.posting_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, posting_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  value={formData.platform || 'facebook'}
                  onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                  <option value="google_analytics">Google Analytics</option>
                  <option value="google_ads">Google Ads</option>
                </select>
              </div>
              <div>
                <Label htmlFor="content_type">Content Type</Label>
                <select
                  id="content_type"
                  value={formData.content_type || 'post'}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_type: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="post">Post</option>
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="carousel">Carousel</option>
                  <option value="story">Story</option>
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status || 'draft'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Strategy Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="objective">Objective</Label>
                <Input
                  id="objective"
                  value={formData.objective || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                  placeholder="e.g., brand_awareness, engagement, leads"
                />
              </div>
              <div>
                <Label htmlFor="content_pillar">Content Pillar</Label>
                <Input
                  id="content_pillar"
                  value={formData.content_pillar || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_pillar: e.target.value }))}
                  placeholder="e.g., educational, entertainment, inspiration"
                />
              </div>
            </div>

            {/* Content Details */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the content"
              />
            </div>

            <div>
              <Label htmlFor="creative_guidance">Creative Guidance</Label>
              <Input
                id="creative_guidance"
                value={formData.creative_guidance || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, creative_guidance: e.target.value }))}
                placeholder="Creative direction and visual suggestions"
              />
            </div>

            <div>
              <Label htmlFor="caption">Caption</Label>
              <textarea
                id="caption"
                value={formData.caption || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Social media caption text"
                className="w-full p-2 border rounded-md min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="hashtags">Hashtags</Label>
              <Input
                id="hashtags"
                value={formData.hashtags?.join(' ') || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  hashtags: e.target.value.split(' ').filter(tag => tag.trim()) 
                }))}
                placeholder="#hashtag1 #hashtag2 #hashtag3"
              />
            </div>

            {/* Attachments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Attachments</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAttachment}>
                  <Paperclip className="h-4 w-4 mr-2" />
                  Add Attachment
                </Button>
              </div>
              <div className="space-y-2">
                {formData.attachments?.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                    <Input
                      placeholder="Attachment name"
                      value={attachment.name}
                      onChange={(e) => updateAttachment(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="URL"
                      value={attachment.url}
                      onChange={(e) => updateAttachment(index, 'url', e.target.value)}
                    />
                    <select
                      value={attachment.type}
                      onChange={(e) => updateAttachment(index, 'type', e.target.value)}
                      className="p-2 border rounded"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="document">Document</option>
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or reminders"
                className="w-full p-2 border rounded-md min-h-[100px]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                {content && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
