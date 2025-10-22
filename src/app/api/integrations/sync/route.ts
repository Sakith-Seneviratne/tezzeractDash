import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { IntegrationFactory } from '@/lib/integrations/integration-factory';

export async function POST(request: NextRequest) {
  try {
    const { integrationId, startDate, endDate } = await request.json();
    
    if (!integrationId) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get the integration details
    const { data: integration, error: fetchError } = await supabase
      .from('data_streams')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (fetchError || !integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Create the integration instance
    const integrationInstance = IntegrationFactory.createIntegration(
      integration.platform_type as 'facebook' | 'twitter' | 'google_analytics',
      integration.organization_id,
      integration.config
    );

    // Test connection first
    const isConnected = await integrationInstance.testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Integration connection failed' },
        { status: 400 }
      );
    }

    // Sync data
    const syncStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const syncEndDate = endDate ? new Date(endDate) : new Date();

    await integrationInstance.syncData(syncStartDate, syncEndDate, integrationId);

    return NextResponse.json({
      success: true,
      message: 'Data synced successfully',
      platform: integration.platform_type,
      dateRange: {
        start: syncStartDate.toISOString(),
        end: syncEndDate.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error syncing integration:', error);
    return NextResponse.json(
      { error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}
