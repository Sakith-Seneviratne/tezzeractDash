"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer,
  Target,
  DollarSign,
  Heart
} from 'lucide-react';
import { DashboardMetrics, TimeRange, PlatformType, PlatformMetrics } from '@/types';
import { MetricCard } from '@/components/dashboard/metric-card';
import { PlatformCard } from '@/components/dashboard/platform-card';
import { AIInsights } from '@/components/dashboard/ai-insights';
import { LineChartComponent } from '@/components/charts/line-chart';
import { BarChartComponent } from '@/components/charts/bar-chart';
import { useLLM } from '@/hooks/use-llm';

const timeRanges: TimeRange[] = [
  { label: 'Today', value: 'today', startDate: new Date(), endDate: new Date() },
  { label: 'Last 7 days', value: '7d', startDate: new Date(), endDate: new Date() },
  { label: 'Last 30 days', value: '30d', startDate: new Date(), endDate: new Date() },
  { label: 'Last 90 days', value: '90d', startDate: new Date(), endDate: new Date() },
];

export default function DashboardPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    impressions: 0,
    reach: 0,
    engagement: 0,
    clicks: 0,
    conversions: 0,
    followers: 0,
  });
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [platformChartData, setPlatformChartData] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [, setLoading] = useState(true);
  const { generateInsights, loading: llmLoading } = useLLM();

  useEffect(() => {
    // Mock data for now - will be replaced with real data fetching
    const mockMetrics: DashboardMetrics = {
      impressions: 125000,
      reach: 45000,
      engagement: 3200,
      clicks: 850,
      conversions: 45,
      followers: 12500,
    };

    const mockPlatformMetrics: PlatformMetrics[] = [
      {
        platform: 'facebook' as PlatformType,
        metrics: {
          impressions: 45000,
          reach: 18000,
          engagement: 1200,
          clicks: 300,
          conversions: 15,
          followers: 5000,
        },
        change: 12.5,
        trend: 'up',
      },
      {
        platform: 'instagram' as PlatformType,
        metrics: {
          impressions: 35000,
          reach: 15000,
          engagement: 1800,
          clicks: 250,
          conversions: 20,
          followers: 4000,
        },
        change: 8.2,
        trend: 'up',
      },
      {
        platform: 'linkedin' as PlatformType,
        metrics: {
          impressions: 25000,
          reach: 8000,
          engagement: 800,
          clicks: 200,
          conversions: 8,
          followers: 2500,
        },
        change: 15.3,
        trend: 'up',
      },
      {
        platform: 'google_analytics' as PlatformType,
        metrics: {
          impressions: 20000,
          reach: 4000,
          engagement: 400,
          clicks: 100,
          conversions: 2,
          followers: 1000,
        },
        change: -2.1,
        trend: 'down',
      },
    ];

    // Generate chart data for the last 30 days
    const generateChartData = () => {
      const data = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          impressions: Math.floor(Math.random() * 5000) + 2000,
          engagement: Math.floor(Math.random() * 200) + 50,
          clicks: Math.floor(Math.random() * 50) + 10,
        });
      }
      return data;
    };

    const generatePlatformData = () => {
      return [
        { name: 'Facebook', value: 45000 },
        { name: 'Instagram', value: 35000 },
        { name: 'LinkedIn', value: 25000 },
        { name: 'Google Analytics', value: 20000 },
      ];
    };
    
    setTimeout(async () => {
      setMetrics(mockMetrics);
      setPlatformMetrics(mockPlatformMetrics);
      setChartData(generateChartData());
      setPlatformChartData(generatePlatformData());
      
      // Generate AI insights
      const insights = await generateInsights(mockMetrics, mockPlatformMetrics);
      if (insights) {
        setAiInsights(insights);
      } else {
        // Fallback to mock insights if LLM fails
        setAiInsights({
          summary: "Your social media performance has shown strong growth this month, with a 15.3% increase in overall engagement. Video content on Instagram is driving the highest engagement rates, while LinkedIn posts are generating quality B2B leads.",
          recommendations: [
            "Post 3 more video content pieces this week to capitalize on Instagram's algorithm",
            "Focus on LinkedIn for B2B engagement - your posts there have 15.3% higher engagement",
            "Optimize posting times for 2-4 PM when your audience is most active",
            "Create more carousel posts on Instagram as they perform 40% better than single images",
            "Consider running a LinkedIn campaign to boost your B2B reach"
          ],
          performance: {
            bestPerforming: "Instagram Video Content",
            needsImprovement: "Google Analytics Traffic"
          }
        });
      }
      
      setLoading(false);
    }, 1000);
  }, [selectedTimeRange, generateInsights]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your social media performance
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={selectedTimeRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Impressions"
          value={metrics.impressions}
          change={12.5}
          trend="up"
          icon={Eye}
        />
        <MetricCard
          title="Reach"
          value={metrics.reach}
          change={8.2}
          trend="up"
          icon={Users}
        />
        <MetricCard
          title="Engagement"
          value={metrics.engagement}
          change={15.3}
          trend="up"
          icon={Heart}
        />
        <MetricCard
          title="Clicks"
          value={metrics.clicks}
          change={5.7}
          trend="up"
          icon={MousePointer}
        />
        <MetricCard
          title="Conversions"
          value={metrics.conversions}
          change={22.1}
          trend="up"
          icon={Target}
          format="number"
        />
        <MetricCard
          title="Revenue"
          value={12500}
          change={18.5}
          trend="up"
          icon={DollarSign}
          format="currency"
        />
      </div>

      {/* Charts and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Daily metrics over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartComponent 
                data={chartData} 
                dataKey="impressions" 
                color="#00A9EE"
                height={300}
              />
            </CardContent>
          </Card>

          {/* Platform Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>
                Individual platform metrics and comparisons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platformMetrics.map((platform) => (
                  <PlatformCard
                    key={platform.platform}
                    platform={platform.platform}
                    metrics={platform}
                    onViewDetails={() => console.log('View details for', platform.platform)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          {aiInsights ? (
            <AIInsights insights={aiInsights} />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  {llmLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  ) : (
                    <p className="text-muted-foreground">Loading AI insights...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Platform Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
          <CardDescription>
            Impressions breakdown by platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarChartComponent 
            data={platformChartData} 
            dataKey="value" 
            color="#00378A"
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  );
}
