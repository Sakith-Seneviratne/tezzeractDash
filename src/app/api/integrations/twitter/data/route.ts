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

    // Get user's Twitter profile info
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=id,name,username,public_metrics', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Twitter user API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch Twitter user data' },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    const user = userData.data;
    const metrics = user.public_metrics;

    // Get user's tweets for the specified period
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${user.id}/tweets?start_time=${startDate.toISOString()}&end_time=${endDate.toISOString()}&tweet.fields=public_metrics,created_at&max_results=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    let tweetMetrics = {
      totalImpressions: 0,
      totalEngagement: 0,
      totalRetweets: 0,
      totalLikes: 0,
      totalReplies: 0,
      tweetCount: 0,
    };

    if (tweetsResponse.ok) {
      const tweetsData = await tweetsResponse.json();
      const tweets = tweetsData.data || [];

      tweets.forEach((tweet: any) => {
        const tweetMetrics = tweet.public_metrics;
        tweetMetrics.totalImpressions += tweetMetrics.impression_count || 0;
        tweetMetrics.totalEngagement += (tweetMetrics.like_count || 0) + (tweetMetrics.retweet_count || 0) + (tweetMetrics.reply_count || 0);
        tweetMetrics.totalRetweets += tweetMetrics.retweet_count || 0;
        tweetMetrics.totalLikes += tweetMetrics.like_count || 0;
        tweetMetrics.totalReplies += tweetMetrics.reply_count || 0;
        tweetMetrics.tweetCount += 1;
      });
    }

    // Map Twitter metrics to our dashboard format
    const dashboardMetrics = {
      impressions: tweetMetrics.totalImpressions || 0,
      reach: tweetMetrics.totalImpressions || 0, // Using impressions as reach for Twitter
      engagement: tweetMetrics.totalEngagement || 0,
      clicks: tweetMetrics.totalRetweets || 0, // Using retweets as clicks
      conversions: 0, // Would need separate conversion tracking
      followers: metrics?.followers_count || 0,
      tweets: tweetMetrics.tweetCount || 0,
      likes: tweetMetrics.totalLikes || 0,
      retweets: tweetMetrics.totalRetweets || 0,
      replies: tweetMetrics.totalReplies || 0,
      following: metrics?.following_count || 0,
      listed: metrics?.listed_count || 0,
    };

    return NextResponse.json({
      success: true,
      metrics: dashboardMetrics,
      raw_data: {
        user: user,
        tweetMetrics: tweetMetrics,
        dateRange: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      },
    });
  } catch (error) {
    console.error('Twitter data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Twitter data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
