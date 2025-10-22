import { BaseIntegration, IntegrationConfig, IntegrationData, PlatformMetrics } from './base-integration';

export class MetaIntegration extends BaseIntegration {
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';

  getPlatformType(): string {
    return 'facebook';
  }

  getPlatformName(): string {
    return 'Meta (Facebook & Instagram)';
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/me`);
      return response.ok;
    } catch (error) {
      console.error('Meta connection test failed:', error);
      return false;
    }
  }

  async refreshToken(): Promise<IntegrationConfig> {
    try {
      const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID!,
          client_secret: process.env.META_APP_SECRET!,
          fb_exchange_token: this.config.access_token,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh Meta token');
      }

      const data = await response.json();
      const newConfig = {
        ...this.config,
        access_token: data.access_token,
        expires_at: data.expires_in ? Date.now() / 1000 + data.expires_in : undefined,
      };

      this.config = newConfig;
      return newConfig;
    } catch (error) {
      console.error('Error refreshing Meta token:', error);
      throw error;
    }
  }

  async fetchData(startDate: Date, endDate: Date): Promise<IntegrationData[]> {
    const data: IntegrationData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      try {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Fetch Facebook page insights
        const facebookData = await this.fetchFacebookInsights(dateStr) as PlatformMetrics;
        
        // Fetch Instagram account insights
        const instagramData = await this.fetchInstagramInsights(dateStr) as PlatformMetrics;

        // Combine metrics
        const combinedMetrics: PlatformMetrics = {
          impressions: (facebookData?.impressions || 0) + (instagramData?.impressions || 0),
          reach: (facebookData?.reach || 0) + (instagramData?.reach || 0),
          engagement: (facebookData?.engagement || 0) + (instagramData?.engagement || 0),
          clicks: (facebookData?.clicks || 0) + (instagramData?.clicks || 0),
          conversions: (facebookData?.conversions || 0) + (instagramData?.conversions || 0),
          followers: (facebookData?.followers || 0) + (instagramData?.followers || 0),
        };

        data.push({
          date: dateStr,
          metrics: combinedMetrics,
          raw_data: {
            facebook: facebookData,
            instagram: instagramData,
          },
        });

        currentDate.setDate(currentDate.getDate() + 1);
      } catch (error) {
        console.error(`Error fetching Meta data for ${currentDate.toISOString().split('T')[0]}:`, error);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return data;
  }

  private async fetchFacebookInsights(date: string): Promise<Record<string, unknown>> {
    try {
      // Get page insights
      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/me/insights?metric=page_impressions,page_reach,page_engaged_users,page_clicks&since=${date}&until=${date}`
      );

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }

      const data = await response.json();
      const insights = data.data || [];

      return {
        impressions: this.extractMetricValue(insights, 'page_impressions'),
        reach: this.extractMetricValue(insights, 'page_reach'),
        engagement: this.extractMetricValue(insights, 'page_engaged_users'),
        clicks: this.extractMetricValue(insights, 'page_clicks'),
        conversions: 0, // Facebook doesn't provide direct conversion data
        followers: 0, // Would need separate API call for followers
      };
    } catch (error) {
      console.error('Error fetching Facebook insights:', error);
      return {
        impressions: 0,
        reach: 0,
        engagement: 0,
        clicks: 0,
        conversions: 0,
        followers: 0,
      };
    }
  }

  private async fetchInstagramInsights(date: string): Promise<Record<string, unknown>> {
    try {
      // Get Instagram business account insights
      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/me/insights?metric=impressions,reach,profile_views,website_clicks&since=${date}&until=${date}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }

      const data = await response.json();
      const insights = data.data || [];

      return {
        impressions: this.extractMetricValue(insights, 'impressions'),
        reach: this.extractMetricValue(insights, 'reach'),
        engagement: this.extractMetricValue(insights, 'profile_views'),
        clicks: this.extractMetricValue(insights, 'website_clicks'),
        conversions: 0, // Instagram doesn't provide direct conversion data
        followers: 0, // Would need separate API call for followers
      };
    } catch (error) {
      console.error('Error fetching Instagram insights:', error);
      return {
        impressions: 0,
        reach: 0,
        engagement: 0,
        clicks: 0,
        conversions: 0,
        followers: 0,
      };
    }
  }

  private extractMetricValue(insights: Record<string, unknown>[], metricName: string): number {
    const metric = insights.find(insight => insight.name === metricName);
    if (metric && metric.values && Array.isArray(metric.values) && metric.values.length > 0) {
      const firstValue = metric.values[0] as { value?: number };
      return firstValue?.value || 0;
    }
    return 0;
  }
}
