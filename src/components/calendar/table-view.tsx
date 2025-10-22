"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  ChevronUp,
  ChevronDown,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { ContentCalendar } from '@/types';

interface TableViewProps {
  contentItems: ContentCalendar[];
  onAddContent: () => void;
  onEditContent: (item: ContentCalendar) => void;
  onDeleteContent: (id: string) => void;
}

type SortField = 'posting_date' | 'title' | 'platform' | 'status';
type SortDirection = 'asc' | 'desc';

export function TableView({ 
  contentItems, 
  onAddContent, 
  onEditContent, 
  onDeleteContent 
}: TableViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('posting_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getPlatformIcon = (platform: string) => {
    const icons = {
      facebook: Facebook,
      instagram: Instagram,
      linkedin: Linkedin,
      twitter: Twitter,
      google_analytics: BarChart3,
      google_ads: DollarSign,
    };
    const Icon = icons[platform as keyof typeof icons] || BarChart3;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedItems = contentItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: unknown = a[sortField];
      let bValue: unknown = b[sortField];

      if (sortField === 'posting_date') {
        aValue = new Date(String(aValue));
        bValue = new Date(String(bValue));
      }

      if (sortDirection === 'asc') {
        return (aValue as Date | string) > (bValue as Date | string) ? 1 : -1;
      } else {
        return (aValue as Date | string) < (bValue as Date | string) ? 1 : -1;
      }
    });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium"
    >
      <span className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="h-3 w-3" /> : 
            <ChevronDown className="h-3 w-3" />
        )}
      </span>
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Content Calendar - Table View</CardTitle>
            <CardDescription>
              Manage your content schedule in table format
            </CardDescription>
          </div>
          <Button onClick={onAddContent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">
                  <SortButton field="posting_date">Date</SortButton>
                </th>
                <th className="text-left p-3">
                  <SortButton field="title">Title</SortButton>
                </th>
                <th className="text-left p-3">
                  <SortButton field="platform">Platform</SortButton>
                </th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Objective</th>
                <th className="text-left p-3">Pillar</th>
                <th className="text-left p-3">
                  <SortButton field="status">Status</SortButton>
                </th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedItems.length > 0 ? (
                filteredAndSortedItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {item.posting_date ? new Date(item.posting_date + 'T00:00:00').toLocaleDateString() : 'No date'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {item.description}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(item.platform)}
                        <span className="capitalize">{item.platform}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="capitalize">
                        {item.content_type}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{item.objective}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{item.content_pillar}</span>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditContent(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteContent(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No content found. Click &quot;Add Content&quot; to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {filteredAndSortedItems.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredAndSortedItems.length} of {contentItems.length} items
              </span>
              <div className="flex items-center space-x-4">
                <span>Draft: {contentItems.filter(i => i.status === 'draft').length}</span>
                <span>Scheduled: {contentItems.filter(i => i.status === 'scheduled').length}</span>
                <span>Published: {contentItems.filter(i => i.status === 'published').length}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
