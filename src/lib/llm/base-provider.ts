import { LLMRequest, LLMResponse } from './types';

export abstract class BaseLLMProvider {
  protected apiKey: string;
  protected model: string;
  protected temperature: number;
  protected maxTokens: number;

  constructor(config: {
    apiKey: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 1000;
  }

  abstract generateContent(request: LLMRequest): Promise<LLMResponse>;
  
  protected validateRequest(request: LLMRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }
  }

  protected formatResponse(content: string, usage?: Record<string, unknown>): LLMResponse {
    return {
      content: content.trim(),
      usage: usage ? {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
      } : undefined,
    };
  }
}
