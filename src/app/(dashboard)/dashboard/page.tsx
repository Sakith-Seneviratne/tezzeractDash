"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
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

interface ChartDataPoint {
  [key: string]: string | number;
  date: string;
  value: number;
  impressions: number;
  engagement: number;
  clicks: number;
}

interface PlatformChartData {
  [key: string]: string | number;
  name: string;
  value: number;
}

interface AIInsight {
  summary: string;
  recommendations: string[];
  performance: {
    bestPerforming: string;
    needsImprovement: string;
  };
}

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
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [platformChartData, setPlatformChartData] = useState<PlatformChartData[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);

  // Load mock data on mount and when time range changes
  useEffect(() => {
    setLoading(true);
    setAiInsights(null); // Reset insights when time range changes
    
    // Check if Twitter/X is connected
    const fetchTwitterData = async () => {
      try {
        const twitterTokens = localStorage.getItem('twitter_tokens');
        if (twitterTokens) {
          const tokens = JSON.parse(twitterTokens);
          const response = await fetch(`/api/integrations/twitter/data?access_token=${tokens.access_token}&date_range=${selectedTimeRange}`);
          
          if (response.ok) {
            const data = await response.json();
            return data.metrics;
          }
        }
      } catch (error) {
        console.error('Error fetching Twitter data:', error);
      }
      return null;
    };

    // Check if Google Analytics is connected
    const fetchGoogleAnalyticsData = async () => {
      try {
        const googleTokens = localStorage.getItem('google_tokens');
        if (googleTokens) {
          const tokens = JSON.parse(googleTokens);
          // Include property ID if it was selected
          const propertyParam = tokens.propertyId ? `&property_id=${tokens.propertyId}` : '';
          const response = await fetch(`/api/integrations/google-analytics/data?access_token=${tokens.access_token}${propertyParam}&date_range=${selectedTimeRange}`);
          
          if (response.ok) {
            const data = await response.json();
            return data.metrics;
          }
        }
      } catch (error) {
        console.error('Error fetching Google Analytics data:', error);
      }
      return null;
    };

    // Check if Meta (Facebook & Instagram) is connected
    const fetchMetaData = async () => {
      try {
        const metaTokens = localStorage.getItem('meta_tokens');
        if (metaTokens) {
          const tokens = JSON.parse(metaTokens);
          const response = await fetch(`/api/integrations/meta/data?access_token=${tokens.access_token}&date_range=${selectedTimeRange}`);
          
          if (response.ok) {
            const data = await response.json();
            return data.metrics;
          }
        }
      } catch (error) {
        console.error('Error fetching Meta data:', error);
      }
      return null;
    };
    
    // Initialize with zero values - will be populated with real data
    const mockMetrics: DashboardMetrics = {
      impressions: 0,
      reach: 0,
      engagement: 0,
      clicks: 0,
      conversions: 0,
      followers: 0,
    };

    const mockPlatformMetrics: PlatformMetrics[] = [
      {
        platform: 'facebook' as PlatformType,
        metrics: {
          impressions: 0,
          reach: 0,
          engagement: 0,
          clicks: 0,
          conversions: 0,
          followers: 0,
        },
        change: 0,
        trend: 'stable',
      },
      {
        platform: 'instagram' as PlatformType,
        metrics: {
          impressions: 0,
          reach: 0,
          engagement: 0,
          clicks: 0,
          conversions: 0,
          followers: 0,
        },
        change: 0,
        trend: 'stable',
      },
      {
        platform: 'twitter' as PlatformType,
        metrics: {
          impressions: 0,
          reach: 0,
          engagement: 0,
          clicks: 0,
          conversions: 0,
          followers: 0,
        },
        change: 0,
        trend: 'stable',
      },
      {
        platform: 'google_analytics' as PlatformType,
        metrics: {
          impressions: 0,
          reach: 0,
          engagement: 0,
          clicks: 0,
          conversions: 0,
          followers: 0,
        },
        change: 0,
        trend: 'stable',
      },
    ];

    // Generate chart data based on selected date range
    const generateChartData = (): ChartDataPoint[] => {
      const data: ChartDataPoint[] = [];
      // Determine number of days based on selected range
      let days = 30;
      if (selectedTimeRange === '7d') days = 7;
      else if (selectedTimeRange === '30d') days = 30;
      else if (selectedTimeRange === '90d') days = 90;
      else if (selectedTimeRange === 'today') days = 1;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: 0,
          impressions: 0,
          engagement: 0,
          clicks: 0,
        });
      }
      return data;
    };

    const generatePlatformData = (): PlatformChartData[] => {
      return [
        { name: 'Facebook', value: 0 },
        { name: 'Instagram', value: 0 },
        { name: 'Twitter/X', value: 0 },
        { name: 'Google Analytics', value: 0 },
      ];
    };
    
    const timer = setTimeout(async () => {
      // Fetch real data from connected platforms
      const twitterData = await fetchTwitterData();
      const googleData = await fetchGoogleAnalyticsData();
      const metaData = await fetchMetaData();
      
      let totalImpressions = 0;
      let totalReach = 0;
      let totalEngagement = 0;
      let totalClicks = 0;
      let totalConversions = 0;
      let totalFollowers = 0;
      
      if (twitterData) {
        // Update Twitter platform metrics with real data
        const twitterPlatform = mockPlatformMetrics.find(p => p.platform === 'twitter');
        if (twitterPlatform) {
          twitterPlatform.metrics = twitterData;
          twitterPlatform.change = 0; // Set to 0 since we don't have historical data yet
          twitterPlatform.trend = 'stable';
        }
        
        totalImpressions += twitterData.impressions;
        totalReach += twitterData.reach;
        totalEngagement += twitterData.engagement;
        totalClicks += twitterData.clicks;
        totalConversions += twitterData.conversions;
        totalFollowers += twitterData.followers;
      }
      
      if (googleData) {
        // Update Google Analytics platform metrics with real data
        const googlePlatform = mockPlatformMetrics.find(p => p.platform === 'google_analytics');
        if (googlePlatform) {
          googlePlatform.metrics = googleData;
          googlePlatform.change = 0; // Set to 0 since we don't have historical data yet
          googlePlatform.trend = 'stable';
        }
        
        totalImpressions += googleData.impressions;
        totalReach += googleData.reach;
        totalEngagement += googleData.engagement;
        totalClicks += googleData.clicks;
        totalConversions += googleData.conversions;
      }

      if (metaData) {
        // Update Facebook platform metrics with real data
        const facebookPlatform = mockPlatformMetrics.find(p => p.platform === 'facebook');
        if (facebookPlatform) {
          facebookPlatform.metrics = metaData;
          facebookPlatform.change = 0; // Set to 0 since we don't have historical data yet
          facebookPlatform.trend = 'stable';
        }
        
        totalImpressions += metaData.impressions;
        totalReach += metaData.reach;
        totalEngagement += metaData.engagement;
        totalClicks += metaData.clicks;
        totalConversions += metaData.conversions;
        totalFollowers += metaData.followers;
      }
      
      // Update overall metrics with real data
      if (twitterData || googleData || metaData) {
        mockMetrics.impressions = totalImpressions;
        mockMetrics.reach = totalReach;
        mockMetrics.engagement = totalEngagement;
        mockMetrics.clicks = totalClicks;
        mockMetrics.conversions = totalConversions;
        mockMetrics.followers = totalFollowers;
      }
      
      setMetrics(mockMetrics);
      setPlatformMetrics(mockPlatformMetrics);
      setChartData(generateChartData());
      setPlatformChartData(generatePlatformData());
      setLoading(false);
      
      // Show AI insights with real data
      // Get readable time period text
      const timePeriodText = selectedTimeRange === 'today' ? 'today' : 
                            selectedTimeRange === '7d' ? 'the last 7 days' :
                            selectedTimeRange === '30d' ? 'the last 30 days' :
                            selectedTimeRange === '90d' ? 'the last 90 days' : 'the selected period';
      
      let summary = "Connect your social media platforms and Google Analytics to see personalized insights and recommendations.";
      let recommendations: string[] = [
        "Connect Twitter/X to track your social media performance",
        "Connect Google Analytics to monitor website traffic and conversions",
        "Set up Facebook & Instagram to track social media engagement",
        "Once connected, you'll receive AI-powered recommendations based on your real data"
      ];
      
      if (twitterData && googleData && metaData) {
        summary = `Your connected platforms show strong performance: Twitter/X has ${twitterData.impressions.toLocaleString()} impressions, Facebook & Instagram have ${metaData.impressions.toLocaleString()} impressions with ${metaData.engagement.toLocaleString()} engagements, while your website (Google Analytics) recorded ${googleData.sessions?.toLocaleString() || googleData.impressions.toLocaleString()} sessions with ${googleData.conversions.toLocaleString()} conversions over ${timePeriodText}.`;
        recommendations = [
          `Your website has ${googleData.conversions} conversions - optimize landing pages to increase conversion rate`,
          `Facebook & Instagram engagement is strong at ${metaData.engagement.toLocaleString()} - maintain posting consistency`,
          `Twitter/X has ${twitterData.followers.toLocaleString()} followers - engage with them regularly to build community`,
          `Meta platforms have ${metaData.followers.toLocaleString()} total followers - create engaging content to grow this audience`,
          "Consider cross-promoting your website content across all platforms to drive more traffic"
        ];
      } else if (twitterData && googleData) {
        summary = `Your connected platforms show strong performance: Twitter/X has ${twitterData.impressions.toLocaleString()} impressions with ${twitterData.engagement.toLocaleString()} engagements, while your website (Google Analytics) recorded ${googleData.sessions?.toLocaleString() || googleData.impressions.toLocaleString()} sessions with ${googleData.conversions.toLocaleString()} conversions over ${timePeriodText}.`;
        recommendations = [
          `Your website has ${googleData.conversions} conversions - optimize landing pages to increase conversion rate`,
          `Twitter/X engagement is strong at ${twitterData.engagement.toLocaleString()} - maintain posting consistency`,
          `Website traffic shows ${googleData.users?.toLocaleString() || googleData.reach.toLocaleString()} users - focus on SEO to grow organic reach`,
          `Twitter/X has ${twitterData.followers.toLocaleString()} followers - engage with them regularly to build community`,
          "Connect Facebook & Instagram to expand your social media reach"
        ];
      } else if (twitterData && metaData) {
        summary = `Your social media platforms show strong performance: Twitter/X has ${twitterData.impressions.toLocaleString()} impressions with ${twitterData.engagement.toLocaleString()} engagements, while Facebook & Instagram have ${metaData.impressions.toLocaleString()} impressions with ${metaData.engagement.toLocaleString()} engagements over ${timePeriodText}.`;
        recommendations = [
          `Twitter/X engagement is strong at ${twitterData.engagement.toLocaleString()} - maintain posting consistency`,
          `Facebook & Instagram engagement is at ${metaData.engagement.toLocaleString()} - create more video content to boost this`,
          `Twitter/X has ${twitterData.followers.toLocaleString()} followers - engage with them regularly to build community`,
          `Meta platforms have ${metaData.followers.toLocaleString()} total followers - create engaging content to grow this audience`,
          "Connect Google Analytics to track how social media drives traffic to your website"
        ];
      } else if (googleData && metaData) {
        summary = `Your website and social media show strong performance: Facebook & Instagram have ${metaData.impressions.toLocaleString()} impressions with ${metaData.engagement.toLocaleString()} engagements, while your website (Google Analytics) recorded ${googleData.sessions?.toLocaleString() || googleData.impressions.toLocaleString()} sessions with ${googleData.conversions.toLocaleString()} conversions over ${timePeriodText}.`;
        recommendations = [
          `Your website has ${googleData.conversions} conversions - optimize landing pages to increase conversion rate`,
          `Facebook & Instagram engagement is strong at ${metaData.engagement.toLocaleString()} - maintain posting consistency`,
          `Website traffic shows ${googleData.users?.toLocaleString() || googleData.reach.toLocaleString()} users - focus on SEO to grow organic reach`,
          `Meta platforms have ${metaData.followers.toLocaleString()} total followers - create engaging content to grow this audience`,
          "Connect Twitter/X to add micro-blogging to your social media strategy"
        ];
      } else if (twitterData) {
        summary = `Your Twitter/X account shows ${twitterData.impressions.toLocaleString()} impressions and ${twitterData.engagement.toLocaleString()} engagements over ${timePeriodText}. ${twitterData.followers.toLocaleString()} followers are actively engaging with your content.`;
        recommendations = [
          `Twitter/X engagement is strong at ${twitterData.engagement.toLocaleString()} - maintain posting consistency`,
          `You have ${twitterData.followers.toLocaleString()} followers - engage with them regularly to build community`,
          `${twitterData.clicks.toLocaleString()} clicks show interest - consider adding clear CTAs to your posts`,
          "Connect Google Analytics to track how Twitter/X drives traffic to your website",
          "Connect Facebook & Instagram to expand your social media reach"
        ];
      } else if (googleData) {
        summary = `Your website analytics show ${googleData.sessions?.toLocaleString() || googleData.impressions.toLocaleString()} sessions, ${googleData.users?.toLocaleString() || googleData.reach.toLocaleString()} users, and ${googleData.conversions.toLocaleString()} conversions over ${timePeriodText}.`;
        recommendations = [
          `Your website has ${googleData.conversions} conversions - optimize landing pages to increase this metric`,
          `Website traffic shows ${googleData.users?.toLocaleString() || googleData.reach.toLocaleString()} users - focus on SEO to grow organic reach`,
          `${googleData.engagement.toLocaleString()} engaged sessions indicate quality traffic - keep creating valuable content`,
          "Connect Twitter/X to drive social media traffic to your website",
          "Connect Facebook & Instagram to expand your social media reach"
        ];
      } else if (metaData) {
        summary = `Your Facebook & Instagram accounts show ${metaData.impressions.toLocaleString()} impressions and ${metaData.engagement.toLocaleString()} engagements over ${timePeriodText}. ${metaData.followers.toLocaleString()} followers are actively engaging with your content.`;
        recommendations = [
          `Facebook & Instagram engagement is strong at ${metaData.engagement.toLocaleString()} - maintain posting consistency`,
          `You have ${metaData.followers.toLocaleString()} total followers - create engaging content to grow this audience`,
          `${metaData.clicks.toLocaleString()} clicks show interest - consider adding clear CTAs to your posts`,
          "Connect Twitter/X to add micro-blogging to your social media strategy",
          "Connect Google Analytics to track how social media drives traffic to your website"
        ];
      }
      
      setAiInsights({
        summary,
        recommendations,
        performance: {
          bestPerforming: twitterData ? "Twitter/X Social Media" : (metaData ? "Facebook & Instagram" : (googleData ? "Website Traffic" : "Not enough data yet")),
          needsImprovement: !googleData ? "Website Analytics - Connect Google Analytics" : (!metaData ? "Social Media - Connect Facebook & Instagram" : "Twitter/X - Connect for Micro-blogging")
        }
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedTimeRange]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

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
                Daily metrics over {selectedTimeRange === 'today' ? 'today' : 
                                  selectedTimeRange === '7d' ? 'the last 7 days' :
                                  selectedTimeRange === '30d' ? 'the last 30 days' :
                                  selectedTimeRange === '90d' ? 'the last 90 days' : 'the selected period'}
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading AI insights...</p>
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
