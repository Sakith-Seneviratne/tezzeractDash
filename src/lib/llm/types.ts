export interface LLMProvider {
  id: string;
  name: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface ContentSuggestion {
  postingDate: string;
  title: string;
  platform: string;
  contentType: string;
  objective: string;
  contentPillar: string;
  description: string;
  creativeGuidance: string;
  caption: string;
  hashtags: string[];
}

export interface AnalyticsInsight {
  summary: string;
  recommendations: string[];
  performance: {
    bestPerforming: string;
    needsImprovement: string;
  };
}
