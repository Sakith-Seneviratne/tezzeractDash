import { BaseIntegration, IntegrationConfig, IntegrationData, PlatformMetrics } from './base-integration';

export class LinkedInIntegration extends BaseIntegration {
  private readonly baseUrl = 'https://api.linkedin.com/v2';

  getPlatformType(): string {
    return 'linkedin';
  }

  getPlatformName(): string {
    return 'LinkedIn';
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/me`);
      return response.ok;
    } catch (error) {
      console.error('LinkedIn connection test failed:', error);
      return false;
    }
  }

  async refreshToken(): Promise<IntegrationConfig> {
    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refresh_token!,
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh LinkedIn token');
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
      console.error('Error refreshing LinkedIn token:', error);
      throw error;
    }
  }

  async fetchData(startDate: Date, endDate: Date): Promise<IntegrationData[]> {
    const data: IntegrationData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      try {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Fetch LinkedIn company page analytics
        const insights = await this.fetchCompanyInsights(dateStr);

        data.push({
          date: dateStr,
          metrics: insights.metrics,
          raw_data: insights.raw_data,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      } catch (error) {
        console.error(`Error fetching LinkedIn data for ${currentDate.toISOString().split('T')[0]}:`, error);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return data;
  }

  private async fetchCompanyInsights(date: string): Promise<{ metrics: PlatformMetrics; raw_data: Record<string, unknown> }> {
    try {
      // Get company page analytics
      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED`
      );

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`);
      }

      const aclsData = await response.json();
      const organizationUrn = aclsData.elements?.[0]?.organization;

      if (!organizationUrn) {
        throw new Error('No organization found for user');
      }

      // Extract organization ID from URN
      const orgId = organizationUrn.split(':').pop();

      // Fetch page statistics
      const statsResponse = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/organizationPageStatistics?organization=${organizationUrn}&timeGranularity=DAY&startTime=${date}&endTime=${date}`
      );

      if (!statsResponse.ok) {
        throw new Error(`LinkedIn stats API error: ${statsResponse.status}`);
      }

      const statsData = await statsResponse.json();
      const stats = statsData.elements?.[0] || {};

      // Fetch follower statistics
      const followersResponse = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/organizationFollowerStatistics?organization=${organizationUrn}&timeGranularity=DAY&startTime=${date}&endTime=${date}`
      );

      const followersData = followersResponse.ok ? await followersResponse.json() : { elements: [] };
      const followers = followersData.elements?.[0] || {};

      const metrics: PlatformMetrics = {
        impressions: stats.impressionCount || 0,
        reach: stats.uniqueImpressions || 0,
        engagement: stats.clickCount || 0,
        clicks: stats.clickCount || 0,
        conversions: stats.leadGenerationCount || 0,
        followers: followers.followerCountsByAssociationType?.MEMBER || 0,
      };

      return {
        metrics,
        raw_data: {
          organizationUrn,
          stats,
          followers,
        },
      };
    } catch (error) {
      console.error('Error fetching LinkedIn company insights:', error);
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
