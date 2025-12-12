import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMConfig, LLMProvider } from './types';

/**
 * Default models for each provider
 */
export const DEFAULT_MODELS: Record<LLMProvider, string> = {
  anthropic: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o',
  google: 'gemini-1.5-pro',
  xai: 'grok-beta',
};

/**
 * Create an Anthropic client
 */
export function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey });
}

/**
 * Create an OpenAI client
 */
export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey });
}

/**
 * Create an xAI/Grok client (uses OpenAI SDK with custom baseURL)
 */
export function createXAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  });
}

/**
 * Create a Google AI client
 */
export function createGoogleAIClient(apiKey: string): GoogleGenerativeAI {
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Factory function to create appropriate LLM client based on config
 */
export function createLLMClient(config: LLMConfig): Anthropic | OpenAI | GoogleGenerativeAI {
  switch (config.provider) {
    case 'anthropic':
      return createAnthropicClient(config.apiKey);
    case 'openai':
      return createOpenAIClient(config.apiKey);
    case 'xai':
      return createXAIClient(config.apiKey);
    case 'google':
      return createGoogleAIClient(config.apiKey);
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}

/**
 * Get the default model for a provider
 */
export function getDefaultModel(provider: LLMProvider): string {
  return DEFAULT_MODELS[provider];
}
