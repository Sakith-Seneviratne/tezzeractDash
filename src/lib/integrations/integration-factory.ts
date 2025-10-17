import { BaseIntegration, IntegrationConfig } from './base-integration';
import { MetaIntegration } from './meta-integration';
import { GoogleAnalyticsIntegration } from './google-analytics-integration';

export type PlatformType = 'facebook' | 'twitter' | 'google_analytics';

export class IntegrationFactory {
  static createIntegration(
    platformType: PlatformType,
    organizationId: string,
    config: IntegrationConfig
  ): BaseIntegration {
    switch (platformType) {
      case 'facebook':
        return new MetaIntegration(organizationId, config);
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
        type: 'twitter',
        name: 'Twitter/X',
        description: 'Connect your Twitter/X account',
        oauthUrl: this.getTwitterOAuthUrl(),
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

  private static getTwitterOAuthUrl(): string {
    // Generate code verifier and challenge for PKCE
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallengeSync(codeVerifier);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.TWITTER_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
      scope: 'tweet.read users.read offline.access',
      state: codeVerifier, // Store code_verifier in state
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  }

  private static generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for Node.js
      const crypto = require('crypto');
      const randomBytes = crypto.randomBytes(32);
      array.set(randomBytes);
    }
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private static generateCodeChallengeSync(verifier: string): string {
    // Use Node.js crypto for server-side generation
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(verifier).digest();
    return btoa(String.fromCharCode.apply(null, Array.from(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
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
