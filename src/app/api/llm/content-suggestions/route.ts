import { NextRequest, NextResponse } from 'next/server';
import { LLMService } from '@/lib/llm/llm-service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { analyticsData, objectives, competitorData, provider = 'openai' } = await request.json();
    
    if (!analyticsData) {
      return NextResponse.json(
        { error: 'Missing analytics data' },
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

    const suggestions = await llmService.generateContentSuggestions(
      analyticsData,
      objectives || [],
      competitorData || [],
      provider
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating content suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate content suggestions' },
      { status: 500 }
    );
  }
}
