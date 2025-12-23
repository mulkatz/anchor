/**
 * Token Extractor
 *
 * Extracts token usage from Gemini/Vertex AI response objects.
 * The usageMetadata is included in GenerateContentResult from the SDK.
 */

import { TokenUsage } from './types';

/**
 * Extract token usage from a Gemini generateContent response
 *
 * The Vertex AI SDK includes usageMetadata in responses:
 * - promptTokenCount: tokens in the input
 * - candidatesTokenCount: tokens in the output
 * - totalTokenCount: sum of both
 *
 * @param result - The result from model.generateContent()
 * @returns Token counts or zeros if not available
 */
export function extractTokenUsage(result: unknown): TokenUsage {
  // Navigate the response structure safely
  const response = (result as Record<string, unknown>)?.response as
    | Record<string, unknown>
    | undefined;
  const usageMetadata = response?.usageMetadata as Record<string, number> | undefined;

  if (usageMetadata) {
    const inputTokens = usageMetadata.promptTokenCount || 0;
    const outputTokens = usageMetadata.candidatesTokenCount || 0;

    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };
  }

  // Fallback: Try to estimate from response text length
  // This is a rough approximation: ~4 characters per token on average
  const candidates = (response as Record<string, unknown>)?.candidates as unknown[];
  if (candidates?.[0]) {
    const content = (candidates[0] as Record<string, unknown>)?.content as Record<string, unknown>;
    const parts = content?.parts as Record<string, unknown>[];
    const text = parts?.[0]?.text as string;

    if (text) {
      const estimatedOutputTokens = Math.ceil(text.length / 4);
      return {
        inputTokens: 0, // Can't estimate input without original content
        outputTokens: estimatedOutputTokens,
        totalTokens: estimatedOutputTokens,
      };
    }
  }

  // Default: return zeros
  return {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };
}

/**
 * Extract response text from Gemini result
 * Helper to get the actual text content
 */
export function extractResponseText(result: unknown): string | null {
  try {
    const response = (result as Record<string, unknown>)?.response;
    const candidates = (response as Record<string, unknown>)?.candidates as unknown[];
    const content = (candidates?.[0] as Record<string, unknown>)?.content as Record<
      string,
      unknown
    >;
    const parts = content?.parts as Record<string, unknown>[];
    return (parts?.[0]?.text as string) || null;
  } catch {
    return null;
  }
}

/**
 * Extract finish reason from Gemini result
 * Useful for detecting if response was cut off
 */
export function extractFinishReason(result: unknown): string | null {
  try {
    const response = (result as Record<string, unknown>)?.response;
    const candidates = (response as Record<string, unknown>)?.candidates as unknown[];
    return (candidates?.[0] as Record<string, string>)?.finishReason || null;
  } catch {
    return null;
  }
}
