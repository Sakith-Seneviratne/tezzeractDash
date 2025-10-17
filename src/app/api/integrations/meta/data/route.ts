import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');
    const dateRange = searchParams.get('date_range') || '30d'; // Default to 30 days

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Calculate date range based on the selected period
    const endDate = new Date();
    const startDate = new Date();
    
    // Determine number of days to go back
    let daysToSubtract = 30; // Default
    if (dateRange === 'today') daysToSubtract = 0;
    else if (dateRange === '7d') daysToSubtract = 7;
    else if (dateRange === '30d') daysToSubtract = 30;
    else if (dateRange === '90d') daysToSubtract = 90;
    
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    // Get user's Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    );

    if (!pagesResponse.ok) {
      const errorText = await pagesResponse.text();
      console.error('Meta pages API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch Facebook pages' },
        { status: pagesResponse.status }
      );
    }

    const pagesData = await pagesResponse.json();
    const pages = pagesData.data || [];

    if (pages.length === 0) {
      return NextResponse.json(
        { error: 'No Facebook pages found. Please create a Facebook page first.' },
        { status: 404 }
      );
    }

    // Use the first page for now (you could let user select which page)
    const page = pages[0];
    const pageId = page.id;
    const pageName = page.name;

    // Get Instagram business account connected to this page
    const instagramResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
    );

    let instagramAccountId = null;
    if (instagramResponse.ok) {
      const instagramData = await instagramResponse.json();
      instagramAccountId = instagramData.instagram_business_account?.id;
    }

    // Fetch Facebook page insights
    const facebookInsightsResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_impressions,page_reach,page_engaged_users,page_post_engagements,page_actions_post_reactions_total&since=${formatDate(startDate)}&until=${formatDate(endDate)}&access_token=${accessToken}`
    );

    let facebookMetrics = {
      impressions: 0,
      reach: 0,
      engagement: 0,
      clicks: 0,
      conversions: 0,
      followers: 0,
    };

    if (facebookInsightsResponse.ok) {
      const facebookData = await facebookInsightsResponse.json();
      const insights = facebookData.data || [];

      insights.forEach((insight: any) => {
        const values = insight.values || [];
        const totalValue = values.reduce((sum: number, value: any) => sum + (value.value || 0), 0);
        
        switch (insight.name) {
          case 'page_impressions':
            facebookMetrics.impressions += totalValue;
            break;
          case 'page_reach':
            facebookMetrics.reach += totalValue;
            break;
          case 'page_engaged_users':
            facebookMetrics.engagement += totalValue;
            break;
          case 'page_post_engagements':
            facebookMetrics.clicks += totalValue;
            break;
        }
      });

      // Get page followers count
      const followersResponse = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=followers_count&access_token=${accessToken}`
      );
      
      if (followersResponse.ok) {
        const followersData = await followersResponse.json();
        facebookMetrics.followers = followersData.followers_count || 0;
      }
    }

    // Fetch Instagram insights if available
    let instagramMetrics = {
      impressions: 0,
      reach: 0,
      engagement: 0,
      clicks: 0,
      conversions: 0,
      followers: 0,
    };

    if (instagramAccountId) {
      const instagramInsightsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/insights?metric=impressions,reach,profile_views,website_clicks&since=${formatDate(startDate)}&until=${formatDate(endDate)}&access_token=${accessToken}`
      );

      if (instagramInsightsResponse.ok) {
        const instagramData = await instagramInsightsResponse.json();
        const insights = instagramData.data || [];

        insights.forEach((insight: any) => {
          const values = insight.values || [];
          const totalValue = values.reduce((sum: number, value: any) => sum + (value.value || 0), 0);
          
          switch (insight.name) {
            case 'impressions':
              instagramMetrics.impressions += totalValue;
              break;
            case 'reach':
              instagramMetrics.reach += totalValue;
              break;
            case 'profile_views':
              instagramMetrics.engagement += totalValue;
              break;
            case 'website_clicks':
              instagramMetrics.clicks += totalValue;
              break;
          }
        });

        // Get Instagram followers count
        const instagramFollowersResponse = await fetch(
          `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=followers_count&access_token=${accessToken}`
        );
        
        if (instagramFollowersResponse.ok) {
          const followersData = await instagramFollowersResponse.json();
          instagramMetrics.followers = followersData.followers_count || 0;
        }
      }
    }

    // Combine Facebook and Instagram metrics
    const combinedMetrics = {
      impressions: facebookMetrics.impressions + instagramMetrics.impressions,
      reach: facebookMetrics.reach + instagramMetrics.reach,
      engagement: facebookMetrics.engagement + instagramMetrics.engagement,
      clicks: facebookMetrics.clicks + instagramMetrics.clicks,
      conversions: 0, // Would need separate conversion tracking
      followers: facebookMetrics.followers + instagramMetrics.followers,
      facebook: facebookMetrics,
      instagram: instagramMetrics,
      pageName,
      hasInstagram: !!instagramAccountId,
    };

    return NextResponse.json({
      success: true,
      metrics: combinedMetrics,
      raw_data: {
        facebook: facebookMetrics,
        instagram: instagramMetrics,
        pageId,
        pageName,
        instagramAccountId,
        dateRange: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      },
    });
  } catch (error) {
    console.error('Meta data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Meta data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
