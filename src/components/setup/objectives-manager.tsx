"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Target } from 'lucide-react';

interface Objective {
  id: string;
  type: string;
  description: string;
  target_impressions: number;
  target_reach: number;
  start_date: string;
  end_date: string;
}

const Select = ({ value, onChange, children, ...props }: any) => (
  <select
    value={value}
    onChange={onChange}
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  >
    {children}
  </select>
);

export function ObjectivesManager() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [newObjective, setNewObjective] = useState<Partial<Objective>>({
    type: '',
    description: '',
    target_impressions: 0,
    target_reach: 0,
    start_date: '',
    end_date: ''
  });

  // Load objectives from localStorage on component mount
  useEffect(() => {
    const savedObjectives = localStorage.getItem('organization_objectives');
    if (savedObjectives) {
      try {
        setObjectives(JSON.parse(savedObjectives));
      } catch (error) {
        console.error('Error parsing saved objectives:', error);
      }
    }
  }, []);

  // Save objectives to localStorage whenever objectives change
  useEffect(() => {
    localStorage.setItem('organization_objectives', JSON.stringify(objectives));
  }, [objectives]);

  const addObjective = () => {
    if (!newObjective.type || !newObjective.description) {
      alert('Please fill in type and description');
      return;
    }

    const objective: Objective = {
      id: Date.now().toString(),
      type: newObjective.type!,
      description: newObjective.description!,
      target_impressions: newObjective.target_impressions || 0,
      target_reach: newObjective.target_reach || 0,
      start_date: newObjective.start_date || '',
      end_date: newObjective.end_date || ''
    };

    setObjectives([...objectives, objective]);
    
    // Reset form
    setNewObjective({
      type: '',
      description: '',
      target_impressions: 0,
      target_reach: 0,
      start_date: '',
      end_date: ''
    });
  };

  const removeObjective = (id: string) => {
    setObjectives(objectives.filter(obj => obj.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Business Objectives</h2>
        <p className="text-muted-foreground">
          Set your business goals and targets for content performance
        </p>
      </div>

      {/* Add New Objective Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Add New Objective</span>
          </CardTitle>
          <CardDescription>
            Define your business objectives with specific targets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="objective-type">Objective Type *</Label>
              <Select
                id="objective-type"
                value={newObjective.type}
                onChange={(e) => setNewObjective({ ...newObjective, type: e.target.value })}
              >
                <option value="">Select objective type</option>
                <option value="brand_awareness">Brand Awareness</option>
                <option value="engagement">Engagement</option>
                <option value="lead_generation">Lead Generation</option>
                <option value="sales">Sales</option>
                <option value="traffic">Website Traffic</option>
                <option value="community_building">Community Building</option>
                <option value="product_launch">Product Launch</option>
                <option value="event_promotion">Event Promotion</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective-description">Description *</Label>
              <Input
                id="objective-description"
                placeholder="Describe your objective..."
                value={newObjective.description}
                onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-impressions">Target Impressions</Label>
              <Input
                id="target-impressions"
                type="number"
                placeholder="10000"
                value={newObjective.target_impressions}
                onChange={(e) => setNewObjective({ ...newObjective, target_impressions: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-reach">Target Reach</Label>
              <Input
                id="target-reach"
                type="number"
                placeholder="5000"
                value={newObjective.target_reach}
                onChange={(e) => setNewObjective({ ...newObjective, target_reach: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={newObjective.start_date}
                onChange={(e) => setNewObjective({ ...newObjective, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={newObjective.end_date}
                onChange={(e) => setNewObjective({ ...newObjective, end_date: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={addObjective} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Objective
          </Button>
        </CardContent>
      </Card>

      {/* Existing Objectives List */}
      {objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Objectives ({objectives.length})</CardTitle>
            <CardDescription>
              Your defined business objectives and targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {objectives.map((objective) => (
                <div
                  key={objective.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-accent/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium capitalize">
                        {objective.type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {objective.start_date && objective.end_date 
                          ? `${objective.start_date} - ${objective.end_date}`
                          : 'No date range'
                        }
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {objective.description}
                    </p>
                    <div className="flex space-x-4 text-xs text-muted-foreground">
                      {objective.target_impressions > 0 && (
                        <span>Target Impressions: {objective.target_impressions.toLocaleString()}</span>
                      )}
                      {objective.target_reach > 0 && (
                        <span>Target Reach: {objective.target_reach.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeObjective(objective.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {objectives.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Objectives Yet</h3>
            <p className="text-muted-foreground">
              Add your first business objective to get started with content planning
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}