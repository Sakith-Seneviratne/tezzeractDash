import { createClient } from '@/lib/supabase/server';

export interface IntegrationConfig {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  scope?: string[];
  [key: string]: unknown;
}

export interface PlatformMetrics {
  impressions: number;
  reach: number;
  engagement: number;
  clicks: number;
  conversions: number;
  followers?: number;
  [key: string]: unknown;
}

export interface IntegrationData {
  date: string;
  metrics: PlatformMetrics;
  raw_data: Record<string, unknown>;
}

export abstract class BaseIntegration {
  protected organizationId: string;
  protected config: IntegrationConfig;

  constructor(organizationId: string, config: IntegrationConfig) {
    this.organizationId = organizationId;
    this.config = config;
  }

  abstract getPlatformType(): string;
  abstract getPlatformName(): string;
  abstract testConnection(): Promise<boolean>;
  abstract fetchData(startDate: Date, endDate: Date): Promise<IntegrationData[]>;
  abstract refreshToken(): Promise<IntegrationConfig>;

  protected async saveData(data: IntegrationData[], dataStreamId: string): Promise<void> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('analytics_data')
        .upsert(
          data.map(item => ({
            organization_id: this.organizationId,
            data_stream_id: dataStreamId,
            date: item.date,
            metrics: item.metrics,
            raw_data: item.raw_data,
          })),
          { onConflict: 'organization_id,data_stream_id,date' }
        );

      if (error) {
        console.error(`Error saving ${this.getPlatformName()} data:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error saving ${this.getPlatformName()} data:`, error);
      throw error;
    }
  }

  protected async updateDataStreamStatus(status: 'active' | 'error' | 'pending', lastSyncedAt?: Date): Promise<void> {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('data_streams')
        .update({
          status,
          last_synced_at: lastSyncedAt?.toISOString(),
        })
        .eq('organization_id', this.organizationId)
        .eq('platform_type', this.getPlatformType());

      if (error) {
        console.error(`Error updating ${this.getPlatformName()} status:`, error);
      }
    } catch (error) {
      console.error(`Error updating ${this.getPlatformName()} status:`, error);
    }
  }

  protected isTokenExpired(): boolean {
    if (!this.config.expires_at) return false;
    return Date.now() >= this.config.expires_at * 1000;
  }

  protected async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      'Authorization': `Bearer ${this.config.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token refresh if needed
    if (response.status === 401 && this.config.refresh_token) {
      await this.refreshToken();
      response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          'Authorization': `Bearer ${this.config.access_token}`,
        },
      });
    }

    return response;
  }

  async syncData(startDate: Date, endDate: Date, dataStreamId: string): Promise<void> {
    try {
      await this.updateDataStreamStatus('pending');
      
      const data = await this.fetchData(startDate, endDate);
      await this.saveData(data, dataStreamId);
      
      await this.updateDataStreamStatus('active', new Date());
    } catch (error) {
      console.error(`Error syncing ${this.getPlatformName()} data:`, error);
      await this.updateDataStreamStatus('error');
      throw error;
    }
  }
}
