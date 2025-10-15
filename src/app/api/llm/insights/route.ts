import { NextRequest, NextResponse } from 'next/server';
import { LLMService } from '@/lib/llm/llm-service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { metrics, platformData, provider = 'openai' } = await request.json();
    
    if (!metrics || !platformData) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    const llmService = new LLMService();
    
    if (!llmService.isProviderAvailable(provider)) {
      return NextResponse.json(
        { error: `Provider ${provider} not available` },
        { status: 400 }
      );
    }

    const insights = await llmService.generateAnalyticsInsights(
      metrics,
      platformData,
      provider
    );

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
