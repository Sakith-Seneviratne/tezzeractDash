import { NextRequest, NextResponse } from 'next/server';
import { LLMService } from '@/lib/llm/llm-service';

export async function POST(request: NextRequest) {
  try {
    const { provider, settings } = await request.json();
    
    if (!provider || !settings) {
      return NextResponse.json(
        { error: 'Missing provider or settings' },
        { status: 400 }
      );
    }

    const llmService = new LLMService();
    
    // Test the connection with a simple prompt
    const testPrompt = "Hello, this is a test message. Please respond with 'Connection successful' if you can read this.";
    
    try {
      const response = await llmService.generateContent(
        testPrompt,
        provider,
        {
          temperature: 0.1,
          maxTokens: 50,
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Connection test successful',
        response: response.content,
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } catch (error) {
    console.error('Error testing LLM connection:', error);
    return NextResponse.json(
      { error: 'Failed to test connection' },
      { status: 500 }
    );
  }
}
