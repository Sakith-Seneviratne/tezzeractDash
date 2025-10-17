import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request: NextRequest) {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY not found in environment variables'
      });
    }

    if (!geminiApiKey.startsWith('AIza')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format. Should start with "AIza"'
      });
    }

    // Test the API key with a simple request
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const result = await model.generateContent('Say "Hello, Gemini API is working!" in exactly those words.');
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      message: 'Gemini API is working!',
      response: text,
      api_key_length: geminiApiKey.length,
      api_key_prefix: geminiApiKey.substring(0, 10) + '...'
    });

  } catch (error) {
    console.error('Gemini API test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        message: error.message
      }
    });
  }
}
