"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { formatNumber, formatPercentage } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: LucideIcon;
  format?: 'number' | 'percentage' | 'currency';
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  format = 'number' 
}: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${formatNumber(val)}`;
      default:
        return formatNumber(val);
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <Card className="card-hover animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        <p className="text-xs text-muted-foreground">
          <span className={getTrendColor()}>
            {getTrendIcon()} {formatPercentage(change)}
          </span>{' '}
          from last period
        </p>
      </CardContent>
    </Card>
  );
}
