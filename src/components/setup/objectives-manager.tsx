"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';

interface Objective {
  id: string;
  type: 'monthly' | 'quarterly' | 'yearly';
  description: string;
  target_metrics: Record<string, number>;
  start_date: string;
  end_date: string;
  created_at: string;
}

export function ObjectivesManager() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization } = useAuth();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    type: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    description: '',
    target_metrics: {
      impressions: 0,
      reach: 0,
      engagement: 0,
      clicks: 0,
      conversions: 0,
    },
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    if (selectedOrganization) {
      fetchObjectives();
    }
  }, [selectedOrganization]);

  const fetchObjectives = async () => {
    if (!selectedOrganization) return;

    try {
      const { data, error } = await supabase
        .from('user_objectives')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching objectives:', error);
        return;
      }

      setObjectives(data || []);
    } catch (error) {
      console.error('Error fetching objectives:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      const objectiveData = {
        organization_id: selectedOrganization.id,
        type: formData.type,
        description: formData.description,
        target_metrics: formData.target_metrics,
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      if (editingObjective) {
        // Update existing objective
        const { error } = await supabase
          .from('user_objectives')
          .update(objectiveData)
          .eq('id', editingObjective.id);

        if (error) {
          console.error('Error updating objective:', error);
          return;
        }
      } else {
        // Create new objective
        const { error } = await supabase
          .from('user_objectives')
          .insert(objectiveData);

        if (error) {
          console.error('Error creating objective:', error);
          return;
        }
      }

      await fetchObjectives();
      resetForm();
    } catch (error) {
      console.error('Error saving objective:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this objective?')) return;

    try {
      const { error } = await supabase
        .from('user_objectives')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting objective:', error);
        return;
      }

      await fetchObjectives();
    } catch (error) {
      console.error('Error deleting objective:', error);
    }
  };

  const handleEdit = (objective: Objective) => {
    setEditingObjective(objective);
    setFormData({
      type: objective.type,
      description: objective.description,
      target_metrics: objective.target_metrics,
      start_date: objective.start_date,
      end_date: objective.end_date,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'monthly',
      description: '',
      target_metrics: {
        impressions: 0,
        reach: 0,
        engagement: 0,
        clicks: 0,
        conversions: 0,
      },
      start_date: '',
      end_date: '',
    });
    setEditingObjective(null);
    setShowForm(false);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      monthly: 'bg-blue-100 text-blue-800',
      quarterly: 'bg-green-100 text-green-800',
      yearly: 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'monthly':
        return <Calendar className="h-4 w-4" />;
      case 'quarterly':
        return <TrendingUp className="h-4 w-4" />;
      case 'yearly':
        return <Target className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Objectives</span>
            </CardTitle>
            <CardDescription>
              Set your monthly, quarterly, and yearly goals
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Objective
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-medium mb-4">
              {editingObjective ? 'Edit Objective' : 'Add New Objective'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      type: e.target.value as 'monthly' | 'quarterly' | 'yearly' 
                    }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Increase brand awareness by 20%"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="impressions">Impressions</Label>
                  <Input
                    id="impressions"
                    type="number"
                    value={formData.target_metrics.impressions}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      target_metrics: { ...prev.target_metrics, impressions: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="reach">Reach</Label>
                  <Input
                    id="reach"
                    type="number"
                    value={formData.target_metrics.reach}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      target_metrics: { ...prev.target_metrics, reach: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="engagement">Engagement</Label>
                  <Input
                    id="engagement"
                    type="number"
                    value={formData.target_metrics.engagement}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      target_metrics: { ...prev.target_metrics, engagement: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="clicks">Clicks</Label>
                  <Input
                    id="clicks"
                    type="number"
                    value={formData.target_metrics.clicks}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      target_metrics: { ...prev.target_metrics, clicks: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="conversions">Conversions</Label>
                  <Input
                    id="conversions"
                    type="number"
                    value={formData.target_metrics.conversions}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      target_metrics: { ...prev.target_metrics, conversions: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingObjective ? 'Update' : 'Create')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {objectives.length > 0 ? (
            objectives.map((objective) => (
              <div key={objective.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(objective.type)}
                    <div>
                      <h4 className="font-medium">{objective.description}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(objective.start_date).toLocaleDateString()} - {new Date(objective.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(objective.type)}>
                      {objective.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(objective)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(objective.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  {Object.entries(objective.target_metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="font-medium">{value.toLocaleString()}</div>
                      <div className="text-muted-foreground capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No objectives set yet. Click "Add Objective" to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
