"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Twitter
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';

interface Competitor {
  id: string;
  name: string;
  platform: string;
  url: string;
  notes?: string;
  created_at: string;
}

export function CompetitorManager() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization } = useAuth();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    platform: 'website',
    url: '',
    notes: '',
  });

  useEffect(() => {
    if (selectedOrganization) {
      fetchCompetitors();
    }
  }, [selectedOrganization]);

  const fetchCompetitors = async () => {
    if (!selectedOrganization) return;

    try {
      const { data, error } = await supabase
        .from('competitor_data')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching competitors:', error);
        return;
      }

      setCompetitors(data || []);
    } catch (error) {
      console.error('Error fetching competitors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      const competitorData = {
        organization_id: selectedOrganization.id,
        name: formData.name,
        platform: formData.platform,
        url: formData.url,
        notes: formData.notes,
      };

      if (editingCompetitor) {
        // Update existing competitor
        const { error } = await supabase
          .from('competitor_data')
          .update(competitorData)
          .eq('id', editingCompetitor.id);

        if (error) {
          console.error('Error updating competitor:', error);
          return;
        }
      } else {
        // Create new competitor
        const { error } = await supabase
          .from('competitor_data')
          .insert(competitorData);

        if (error) {
          console.error('Error creating competitor:', error);
          return;
        }
      }

      await fetchCompetitors();
      resetForm();
    } catch (error) {
      console.error('Error saving competitor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this competitor?')) return;

    try {
      const { error } = await supabase
        .from('competitor_data')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting competitor:', error);
        return;
      }

      await fetchCompetitors();
    } catch (error) {
      console.error('Error deleting competitor:', error);
    }
  };

  const handleEdit = (competitor: Competitor) => {
    setEditingCompetitor(competitor);
    setFormData({
      name: competitor.name,
      platform: competitor.platform,
      url: competitor.url,
      notes: competitor.notes || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      platform: 'website',
      url: '',
      notes: '',
    });
    setEditingCompetitor(null);
    setShowForm(false);
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      website: Globe,
      facebook: Facebook,
      instagram: Instagram,
      linkedin: Linkedin,
      twitter: Twitter,
    };
    const Icon = icons[platform as keyof typeof icons] || Globe;
    return <Icon className="h-4 w-4" />;
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      website: 'bg-gray-100 text-gray-800',
      facebook: 'bg-blue-100 text-blue-800',
      instagram: 'bg-pink-100 text-pink-800',
      linkedin: 'bg-blue-100 text-blue-800',
      twitter: 'bg-blue-100 text-blue-800',
    };
    return colors[platform as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Competitor Analysis</span>
            </CardTitle>
            <CardDescription>
              Track your competitors&apos; performance
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Competitor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-medium mb-4">
              {editingCompetitor ? 'Edit Competitor' : 'Add New Competitor'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Competitor Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Competitor Company"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <select
                    id="platform"
                    value={formData.platform}
                    onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="website">Website</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about this competitor"
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingCompetitor ? 'Update' : 'Add')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {competitors.length > 0 ? (
            competitors.map((competitor) => (
              <div key={competitor.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getPlatformIcon(competitor.platform)}
                    <div>
                      <h4 className="font-medium">{competitor.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Added {new Date(competitor.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPlatformColor(competitor.platform)}>
                      {competitor.platform}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(competitor.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(competitor)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(competitor.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {competitor.notes && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Notes:</strong> {competitor.notes}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No competitors added yet. Click &quot;Add Competitor&quot; to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
