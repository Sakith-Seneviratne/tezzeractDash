import { BaseIntegration, IntegrationConfig, IntegrationData, PlatformMetrics } from './base-integration';

export class GoogleAnalyticsIntegration extends BaseIntegration {
  private readonly baseUrl = 'https://analyticsreporting.googleapis.com/v4/reports:batchGet';

  getPlatformType(): string {
    return 'google_analytics';
  }

  getPlatformName(): string {
    return 'Google Analytics';
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test connection by making a simple request
      const response = await this.makeAuthenticatedRequest(
        'https://www.googleapis.com/analytics/v3/management/accounts'
      );
      return response.ok;
    } catch (error) {
      console.error('Google Analytics connection test failed:', error);
      return false;
    }
  }

  async refreshToken(): Promise<IntegrationConfig> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refresh_token!,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh Google Analytics token');
      }

      const data = await response.json();
      const newConfig = {
        ...this.config,
        access_token: data.access_token,
        refresh_token: data.refresh_token || this.config.refresh_token,
        expires_at: data.expires_in ? Date.now() / 1000 + data.expires_in : undefined,
      };

      this.config = newConfig;
      return newConfig;
    } catch (error) {
      console.error('Error refreshing Google Analytics token:', error);
      throw error;
    }
  }

  async fetchData(startDate: Date, endDate: Date): Promise<IntegrationData[]> {
    const data: IntegrationData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      try {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Fetch Google Analytics data
        const analyticsData = await this.fetchAnalyticsData(dateStr);

        data.push({
          date: dateStr,
          metrics: analyticsData.metrics,
          raw_data: analyticsData.raw_data,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      } catch (error) {
        console.error(`Error fetching Google Analytics data for ${currentDate.toISOString().split('T')[0]}:`, error);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return data;
  }

  private async fetchAnalyticsData(date: string): Promise<{ metrics: PlatformMetrics; raw_data: any }> {
    try {
      // Get the first available view ID (property)
      const accountsResponse = await this.makeAuthenticatedRequest(
        'https://www.googleapis.com/analytics/v3/management/accounts'
      );

      if (!accountsResponse.ok) {
        throw new Error(`Google Analytics accounts API error: ${accountsResponse.status}`);
      }

      const accountsData = await accountsResponse.json();
      const accountId = accountsData.items?.[0]?.id;

      if (!accountId) {
        throw new Error('No Google Analytics account found');
      }

      // Get properties for the account
      const propertiesResponse = await this.makeAuthenticatedRequest(
        `https://www.googleapis.com/analytics/v3/management/accounts/${accountId}/webproperties`
      );

      if (!propertiesResponse.ok) {
        throw new Error(`Google Analytics properties API error: ${propertiesResponse.status}`);
      }

      const propertiesData = await propertiesResponse.json();
      const propertyId = propertiesData.items?.[0]?.id;

      if (!propertyId) {
        throw new Error('No Google Analytics property found');
      }

      // Get views for the property
      const viewsResponse = await this.makeAuthenticatedRequest(
        `https://www.googleapis.com/analytics/v3/management/accounts/${accountId}/webproperties/${propertyId}/profiles`
      );

      if (!viewsResponse.ok) {
        throw new Error(`Google Analytics views API error: ${viewsResponse.status}`);
      }

      const viewsData = await viewsResponse.json();
      const viewId = viewsData.items?.[0]?.id;

      if (!viewId) {
        throw new Error('No Google Analytics view found');
      }

      // Fetch analytics data for the specific date
      const reportRequest = {
        reportRequests: [
          {
            viewId: viewId,
            dateRanges: [
              {
                startDate: date,
                endDate: date,
              },
            ],
            metrics: [
              { expression: 'ga:sessions' },
              { expression: 'ga:users' },
              { expression: 'ga:pageviews' },
              { expression: 'ga:bounceRate' },
              { expression: 'ga:goalCompletions' },
              { expression: 'ga:goalValue' },
            ],
            dimensions: [
              { name: 'ga:date' },
            ],
          },
        ],
      };

      const response = await this.makeAuthenticatedRequest(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify(reportRequest),
      });

      if (!response.ok) {
        throw new Error(`Google Analytics reporting API error: ${response.status}`);
      }

      const reportData = await response.json();
      const rows = reportData.reports?.[0]?.data?.rows || [];
      const row = rows[0] || {};

      const metrics: PlatformMetrics = {
        impressions: parseInt(row.metrics?.[0]?.values?.[0] || '0'), // sessions as impressions
        reach: parseInt(row.metrics?.[0]?.values?.[1] || '0'), // users as reach
        engagement: parseInt(row.metrics?.[0]?.values?.[2] || '0'), // pageviews as engagement
        clicks: parseInt(row.metrics?.[0]?.values?.[2] || '0'), // pageviews as clicks
        conversions: parseInt(row.metrics?.[0]?.values?.[4] || '0'), // goal completions as conversions
        followers: 0, // Not applicable for Google Analytics
      };

      return {
        metrics,
        raw_data: {
          accountId,
          propertyId,
          viewId,
          reportData,
        },
      };
    } catch (error) {
      console.error('Error fetching Google Analytics data:', error);
      return {
        metrics: {
          impressions: 0,
          reach: 0,
          engagement: 0,
          clicks: 0,
          conversions: 0,
          followers: 0,
        },
        raw_data: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }
}
