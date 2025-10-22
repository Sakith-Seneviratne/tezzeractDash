import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { GoogleProvider } from './google-provider';
import { BaseLLMProvider } from './base-provider';
import { LLMRequest, LLMResponse, ContentSuggestion, AnalyticsInsight } from './types';

export type LLMProviderType = 'openai' | 'anthropic' | 'google';

export class LLMService {
  private providers: Map<LLMProviderType, BaseLLMProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize providers with environment variables
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
      }));
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', new AnthropicProvider({
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: 'claude-3-sonnet-20240229',
        temperature: 0.7,
        maxTokens: 2000,
      }));
    }

    if (process.env.GOOGLE_AI_API_KEY) {
      console.log("Google AI API Key found.");
      this.providers.set('google', new GoogleProvider({
        apiKey: process.env.GOOGLE_AI_API_KEY,
        model: 'gemini-pro',
        temperature: 0.7,
        maxTokens: 2000,
      }));
    }
  }

  async generateContent(
    prompt: string, 
    provider: LLMProviderType = 'openai',
    options?: Partial<LLMRequest>
  ): Promise<LLMResponse> {
    const llmProvider = this.providers.get(provider);
    
    if (!llmProvider) {
      throw new Error(`Provider ${provider} not available or not configured`);
    }

    const request: LLMRequest = {
      prompt,
      ...options,
    };

    return await llmProvider.generateContent(request);
  }

  async generateContentSuggestions(
    analyticsData: Record<string, unknown>,
    objectives: Record<string, unknown>[],
    competitorData: Record<string, unknown>[],
    provider: LLMProviderType = 'openai'
  ): Promise<ContentSuggestion[]> {
    const prompt = this.buildContentSuggestionPrompt(analyticsData, objectives, competitorData);
    
    const response = await this.generateContent(prompt, provider, {
      temperature: 0.8,
      maxTokens: 3000,
    });

    return this.parseContentSuggestions(response.content);
  }

  async generateAnalyticsInsights(
    metrics: Record<string, unknown>,
    platformData: Record<string, unknown>[],
    provider: LLMProviderType = 'openai'
  ): Promise<AnalyticsInsight> {
    const prompt = this.buildAnalyticsInsightPrompt(metrics, platformData);
    
    const response = await this.generateContent(prompt, provider, {
      temperature: 0.6,
      maxTokens: 1500,
    });

    return this.parseAnalyticsInsights(response.content);
  }

  private buildContentSuggestionPrompt(
    analyticsData: Record<string, unknown>,
    objectives: Record<string, unknown>[],
    competitorData: Record<string, unknown>[]
  ): string {
    return `
You are a social media content strategist. Based on the following data, generate 5 content suggestions:

Analytics Data:
${JSON.stringify(analyticsData, null, 2)}

Objectives:
${JSON.stringify(objectives, null, 2)}

Competitor Data:
${JSON.stringify(competitorData, null, 2)}

Please provide content suggestions in the following JSON format:
[
  {
    "postingDate": "2024-01-15",
    "title": "Content Title",
    "platform": "facebook|instagram|linkedin|twitter",
    "contentType": "post|video|carousel|story",
    "objective": "brand_awareness|engagement|leads|sales",
    "contentPillar": "educational|entertainment|inspiration|promotional",
    "description": "Brief description of the content",
    "creativeGuidance": "Creative direction and visual suggestions",
    "caption": "Suggested caption text",
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
  }
]

Make sure the suggestions are relevant to the data provided and align with the objectives.
`;
  }

  private buildAnalyticsInsightPrompt(metrics: Record<string, unknown>, platformData: Record<string, unknown>[]): string {
    return `
You are a data analyst. Analyze the following social media metrics and provide insights:

Metrics:
${JSON.stringify(metrics, null, 2)}

Platform Data:
${JSON.stringify(platformData, null, 2)}

Please provide insights in the following JSON format:
{
  "summary": "Brief summary of overall performance",
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ],
  "performance": {
    "bestPerforming": "What's performing best",
    "needsImprovement": "What needs improvement"
  }
}

Focus on actionable insights and specific recommendations.
`;
  }

  private parseContentSuggestions(content: string): ContentSuggestion[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: return empty array if parsing fails
      return [];
    } catch (error) {
      console.error('Error parsing content suggestions:', error);
      return [];
    }
  }

  private parseAnalyticsInsights(content: string): AnalyticsInsight {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: return default insights
      return {
        summary: "Unable to parse insights from AI response",
        recommendations: ["Please check your data and try again"],
        performance: {
          bestPerforming: "Unknown",
          needsImprovement: "Unknown"
        }
      };
    } catch (error) {
      console.error('Error parsing analytics insights:', error);
      return {
        summary: "Error parsing insights",
        recommendations: ["Please try again"],
        performance: {
          bestPerforming: "Unknown",
          needsImprovement: "Unknown"
        }
      };
    }
  }

  getAvailableProviders(): LLMProviderType[] {
    return Array.from(this.providers.keys());
  }

  isProviderAvailable(provider: LLMProviderType): boolean {
    return this.providers.has(provider);
  }
}
