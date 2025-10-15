"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Target, Lightbulb } from 'lucide-react';

interface AIInsightsProps {
  insights: {
    summary: string;
    recommendations: string[];
    performance: {
      bestPerforming: string;
      needsImprovement: string;
    };
  };
}

export function AIInsights({ insights }: AIInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-gradient" />
          <span>AI Insights</span>
        </CardTitle>
        <CardDescription>
          Intelligent analysis of your data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Summary */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Performance Summary</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            {insights.summary}
          </p>
        </div>

        {/* Performance Highlights */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Best Performing</span>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              {insights.performance.bestPerforming}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium">Needs Improvement</span>
            </div>
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              {insights.performance.needsImprovement}
            </Badge>
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Recommendations</h4>
          </div>
          <ul className="space-y-2">
            {insights.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <Target className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
