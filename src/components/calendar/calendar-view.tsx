"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { ContentCalendar } from '@/types';

interface CalendarViewProps {
  contentItems: ContentCalendar[];
  onAddContent: () => void;
  onEditContent: (item: ContentCalendar) => void;
  onDeleteContent: (id: string) => void;
}

export function CalendarView({ 
  contentItems, 
  onAddContent, 
  onEditContent, 
  onDeleteContent 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getContentForDate = (date: Date) => {
    // Format date in local timezone to avoid timezone shift issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return contentItems.filter(item => item.posting_date === dateStr);
  };

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
    return <Icon className="h-3 w-3" />;
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Content Calendar</CardTitle>
            <CardDescription>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardDescription>
          </div>
          <Button onClick={onAddContent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="outline" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-24 border border-muted/20"></div>;
            }

            const dayContent = getContentForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();

            return (
              <div
                key={day.toISOString()}
                className={`h-24 border border-muted/20 p-1 ${
                  isCurrentMonth ? 'bg-background' : 'bg-muted/20'
                } ${isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {day.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayContent.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="text-xs p-1 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onEditContent(item)}
                    >
                      <div className="flex items-center space-x-1">
                        {getPlatformIcon(item.platform)}
                        <span className="truncate">{item.title}</span>
                      </div>
                      <Badge className={`${getStatusColor(item.status)} text-xs`}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                  
                  {dayContent.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayContent.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="text-sm font-medium mb-3">Status Legend</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
            <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
            <Badge className="bg-green-100 text-green-800">Published</Badge>
            <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
