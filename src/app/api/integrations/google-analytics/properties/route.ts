import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Fetch all GA4 properties
    const accountsResponse = await fetch(
      'https://analyticsadmin.googleapis.com/v1beta/accountSummaries',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error('GA4 accounts API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch GA4 accounts' },
        { status: accountsResponse.status }
      );
    }

    const accountsData = await accountsResponse.json();
    
    // Extract all properties from all accounts
    const properties: Array<{
      propertyId: string;
      displayName: string;
      accountName: string;
    }> = [];

    accountsData.accountSummaries?.forEach((account: Record<string, unknown>) => {
      const accountName = account.displayName as string;
      (account.propertySummaries as Record<string, unknown>[])?.forEach((property: Record<string, unknown>) => {
        // Extract property ID from the property name (format: properties/123456789)
        const propertyName = property.property as string;
        const propertyId = propertyName?.split('/')[1];
        properties.push({
          propertyId,
          displayName: property.displayName as string,
          accountName,
        });
      });
    });

    if (properties.length === 0) {
      return NextResponse.json(
        { error: 'No GA4 properties found. Please create a GA4 property first.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      properties,
    });
  } catch (error) {
    console.error('Google Analytics properties fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google Analytics properties', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

