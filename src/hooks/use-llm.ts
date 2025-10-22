"use client";

import { useState } from 'react';
import { LLMProviderType } from '@/lib/llm/llm-service';
import { ContentSuggestion, AnalyticsInsight } from '@/lib/llm/types';

interface UseLLMReturn {
  generateInsights: (
    metrics: Record<string, unknown>,
    platformData: Record<string, unknown>[],
    provider?: LLMProviderType
  ) => Promise<AnalyticsInsight | null>;
  generateContentSuggestions: (
    analyticsData: Record<string, unknown>,
    objectives?: Record<string, unknown>[],
    competitorData?: Record<string, unknown>[],
    provider?: LLMProviderType
  ) => Promise<ContentSuggestion[]>;
  loading: boolean;
  error: string | null;
}

export function useLLM(): UseLLMReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async (
    metrics: Record<string, unknown>,
    platformData: Record<string, unknown>[],
    provider: LLMProviderType = 'openai'
  ): Promise<AnalyticsInsight | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/llm/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          platformData,
          provider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate insights');
      }

      const data = await response.json();
      return data.insights;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateContentSuggestions = async (
    analyticsData: Record<string, unknown>,
    objectives: Record<string, unknown>[] = [],
    competitorData: Record<string, unknown>[] = [],
    provider: LLMProviderType = 'openai'
  ): Promise<ContentSuggestion[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/llm/content-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyticsData,
          objectives,
          competitorData,
          provider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content suggestions');
      }

      const data = await response.json();
      return data.suggestions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    generateInsights,
    generateContentSuggestions,
    loading,
    error,
  };
}
