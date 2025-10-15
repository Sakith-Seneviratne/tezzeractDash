import { BaseIntegration, IntegrationConfig } from './base-integration';
import { MetaIntegration } from './meta-integration';
import { LinkedInIntegration } from './linkedin-integration';
import { GoogleAnalyticsIntegration } from './google-analytics-integration';

export type PlatformType = 'facebook' | 'linkedin' | 'google_analytics';

export class IntegrationFactory {
  static createIntegration(
    platformType: PlatformType,
    organizationId: string,
    config: IntegrationConfig
  ): BaseIntegration {
    switch (platformType) {
      case 'facebook':
        return new MetaIntegration(organizationId, config);
      case 'linkedin':
        return new LinkedInIntegration(organizationId, config);
      case 'google_analytics':
        return new GoogleAnalyticsIntegration(organizationId, config);
      default:
        throw new Error(`Unsupported platform type: ${platformType}`);
    }
  }

  static getSupportedPlatforms(): Array<{
    type: PlatformType;
    name: string;
    description: string;
    oauthUrl: string;
  }> {
    return [
      {
        type: 'facebook',
        name: 'Meta (Facebook & Instagram)',
        description: 'Connect your Facebook and Instagram business accounts',
        oauthUrl: this.getMetaOAuthUrl(),
      },
      {
        type: 'linkedin',
        name: 'LinkedIn',
        description: 'Connect your LinkedIn company page',
        oauthUrl: this.getLinkedInOAuthUrl(),
      },
      {
        type: 'google_analytics',
        name: 'Google Analytics',
        description: 'Connect your Google Analytics account',
        oauthUrl: this.getGoogleAnalyticsOAuthUrl(),
      },
    ];
  }

  private static getMetaOAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`,
      scope: 'pages_read_engagement,pages_show_list,instagram_basic,instagram_manage_insights',
      response_type: 'code',
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  private static getLinkedInOAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`,
      scope: 'r_liteprofile r_emailaddress w_organization_social',
      state: 'linkedin_oauth_state',
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  private static getGoogleAnalyticsOAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}
