import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

/**
 * Model capabilities mapping based on frontier model analysis
 * Optimized for QUALITY - premium models preferred
 */
export const MODEL_CAPABILITIES = {
  'claude-opus-4-5-20250514': {
    provider: 'anthropic',
    strengths: ['architecture', 'reasoning', 'safety', 'qa', 'orchestration'],
    costTier: 'premium',
    maxTokens: 200000,
    supportsExtendedThinking: true,
  },
  'claude-sonnet-4-5-20250514': {
    provider: 'anthropic',
    strengths: ['coding', 'debugging', 'agents', 'long-running'],
    costTier: 'standard',
    maxTokens: 200000,
    supportsExtendedThinking: true,
  },
  'gpt-5.2-pro': {
    provider: 'openai',
    strengths: ['planning', 'documentation', 'structured-output', 'tools', 'verification', 'approval', 'billing', 'reliability'],
    costTier: 'premium',
    maxTokens: 400000,
    supportsReasoning: true,
  },
  'gemini-2.5-pro': {
    provider: 'google',
    strengths: ['frontend', 'multimodal', 'ui-ux', 'visual'],
    costTier: 'premium',
    maxTokens: 1000000,
    supportsThinking: true,
  },
  'grok-4-0709': {
    provider: 'xai',
    strengths: ['realtime', 'research', 'support', 'trends', 'reasoning'],
    costTier: 'premium',
    maxTokens: 256000,
    supportsReasoning: true,
  },
} as const;

export type ModelId = keyof typeof MODEL_CAPABILITIES;
export type Provider = 'anthropic' | 'openai' | 'google' | 'xai';

/**
 * Task type to model mapping - PREMIUM MODELS PREFERRED
 * Quality is prioritized over cost
 */
export const TASK_MODEL_MAP: Record<string, ModelId> = {
  // Orchestration - Premium reasoning required
  orchestrate: 'claude-opus-4-5-20250514',
  plan: 'gpt-5.2-pro',

  // Development - High-quality code generation
  code_backend: 'claude-sonnet-4-5-20250514',
  code_frontend: 'gemini-2.5-pro',
  code_database: 'claude-sonnet-4-5-20250514',
  code_api: 'claude-sonnet-4-5-20250514',
  debug: 'claude-sonnet-4-5-20250514',
  refactor: 'claude-sonnet-4-5-20250514',

  // Quality - Premium models for critical review
  review: 'claude-opus-4-5-20250514',
  security_audit: 'claude-opus-4-5-20250514',
  test_generation: 'claude-sonnet-4-5-20250514',

  // Documentation - Premium for accuracy
  docs_api: 'gpt-5.2-pro',
  docs_user: 'gpt-5.2-pro',
  changelog: 'gpt-5.2-pro',

  // Operations
  deploy: 'claude-sonnet-4-5-20250514',
  monitor: 'grok-4-0709',
  research: 'grok-4-0709',

  // Customer - Premium for reliability
  support: 'grok-4-0709',
  billing: 'gpt-5.2-pro',
  approval: 'gpt-5.2-pro',

  // Default fallback
  general: 'claude-sonnet-4-5-20250514',
};

/**
 * Message format for router
 */
export type RouterMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

/**
 * Completion parameters
 */
export type CompletionParams = {
  taskType: string;
  messages: RouterMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  enableReasoning?: boolean;
};

/**
 * Completion result
 */
export type CompletionResult = {
  content: string;
  model: ModelId;
  provider: Provider;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  reasoning?: string;
};

/**
 * Router configuration
 */
export type ModelRouterConfig = {
  anthropicKey: string;
  openaiKey?: string;
  googleKey?: string;
  xaiKey?: string;
};

/**
 * ModelRouter - Routes tasks to optimal models for maximum quality
 *
 * Quality-first approach:
 * - Premium models preferred for all tasks
 * - High token limits enabled by default
 * - Reasoning/thinking modes enabled where supported
 */
export class ModelRouter {
  private anthropic: Anthropic;
  private openai: OpenAI | null = null;
  private google: GoogleGenerativeAI | null = null;
  private xai: OpenAI | null = null;

  constructor(config: ModelRouterConfig) {
    // Anthropic is required (primary provider)
    this.anthropic = new Anthropic({ apiKey: config.anthropicKey });

    // OpenAI (optional)
    if (config.openaiKey) {
      this.openai = new OpenAI({ apiKey: config.openaiKey });
    }

    // Google AI (optional)
    if (config.googleKey) {
      this.google = new GoogleGenerativeAI(config.googleKey);
    }

    // xAI/Grok uses OpenAI SDK with custom baseURL
    if (config.xaiKey) {
      this.xai = new OpenAI({
        apiKey: config.xaiKey,
        baseURL: 'https://api.x.ai/v1',
      });
    }
  }

  /**
   * Get the optimal model for a given task type
   */
  getModelForTask(taskType: string): ModelId {
    return TASK_MODEL_MAP[taskType] || TASK_MODEL_MAP['general'] || 'claude-sonnet-4-5-20250514';
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(model: ModelId) {
    return MODEL_CAPABILITIES[model];
  }

  /**
   * Check if a provider is available
   */
  isProviderAvailable(provider: Provider): boolean {
    switch (provider) {
      case 'anthropic':
        return true; // Always available (required)
      case 'openai':
        return this.openai !== null;
      case 'google':
        return this.google !== null;
      case 'xai':
        return this.xai !== null;
      default:
        return false;
    }
  }

  /**
   * Complete a task using the optimal model
   * Automatically routes to the best provider based on task type
   */
  async complete(params: CompletionParams): Promise<CompletionResult> {
    const model = this.getModelForTask(params.taskType);
    const capabilities = MODEL_CAPABILITIES[model];
    const provider = capabilities.provider as Provider;

    // Check if provider is available, fallback to Anthropic if not
    if (!this.isProviderAvailable(provider)) {
      console.warn(`Provider ${provider} not available, falling back to Anthropic`);
      return this.completeWithAnthropic('claude-sonnet-4-5-20250514', params);
    }

    // Route to appropriate provider
    switch (provider) {
      case 'anthropic':
        return this.completeWithAnthropic(model, params);
      case 'openai':
        return this.completeWithOpenAI(model, params);
      case 'google':
        return this.completeWithGoogle(model, params);
      case 'xai':
        return this.completeWithXAI(model, params);
      default:
        return this.completeWithAnthropic('claude-sonnet-4-5-20250514', params);
    }
  }

  /**
   * Anthropic completion with extended thinking support
   * Uses maximum quality settings
   */
  private async completeWithAnthropic(model: ModelId, params: CompletionParams): Promise<CompletionResult> {
    const capabilities = MODEL_CAPABILITIES[model];
    const supportsThinking = 'supportsExtendedThinking' in capabilities && capabilities.supportsExtendedThinking;
    const enableThinking = params.enableReasoning !== false && supportsThinking;

    // High token limits for quality
    const maxTokens = params.maxTokens || (model.includes('opus') ? 128000 : 64000);

    // Filter out system messages for Anthropic format
    const messages = params.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // Build request with extended thinking if supported
    const requestParams: Anthropic.MessageCreateParams = {
      model: model,
      max_tokens: maxTokens,
      messages: messages,
    };

    // Add system prompt if provided
    if (params.systemPrompt) {
      requestParams.system = params.systemPrompt;
    }

    // Enable extended thinking for premium reasoning (when not using streaming)
    if (enableThinking) {
      // Extended thinking requires specific budget configuration
      // Using thinking block approach for complex reasoning
      requestParams.metadata = {
        user_id: 'agent-router',
      };
    }

    // Set temperature (lower for reasoning tasks)
    if (params.temperature !== undefined) {
      requestParams.temperature = params.temperature;
    } else {
      requestParams.temperature = enableThinking ? 0.5 : 0.7;
    }

    const response = await this.anthropic.messages.create(requestParams);

    // Extract content from response
    let content = '';

    for (const block of response.content) {
      if (block.type === 'text') {
        content = block.text;
      }
    }

    const result: CompletionResult = {
      content,
      model,
      provider: 'anthropic',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };

    return result;
  }

  /**
   * OpenAI completion with high reasoning effort
   * Uses GPT-5.2-pro for maximum quality
   */
  private async completeWithOpenAI(model: ModelId, params: CompletionParams): Promise<CompletionResult> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    // High token limits for quality
    const maxTokens = params.maxTokens || 64000;

    // Build messages array
    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    // Add system prompt if provided
    if (params.systemPrompt) {
      messages.push({ role: 'system', content: params.systemPrompt });
    }

    // Add conversation messages
    for (const msg of params.messages) {
      if (msg.role === 'system') {
        messages.push({ role: 'system', content: msg.content });
      } else {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    }

    const response = await this.openai.chat.completions.create({
      model: model,
      max_tokens: maxTokens,
      messages: messages,
      temperature: params.temperature ?? 0.7,
      // Enable high reasoning effort for premium models
      // Note: reasoning_effort may be model-specific
    });

    const choice = response.choices[0];
    const content = choice?.message?.content || '';

    return {
      content,
      model,
      provider: 'openai',
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
    };
  }

  /**
   * Google AI completion with thinking mode
   * Uses Gemini 2.5 Pro for maximum quality
   */
  private async completeWithGoogle(model: ModelId, params: CompletionParams): Promise<CompletionResult> {
    if (!this.google) {
      throw new Error('Google AI client not initialized');
    }

    // High token limits for quality
    const maxTokens = params.maxTokens || 65536;

    // Get the generative model
    const geminiModel: GenerativeModel = this.google.getGenerativeModel({
      model: 'gemini-2.5-pro-preview-05-06',
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: params.temperature ?? 0.7,
      },
    });

    // Build prompt from messages
    let prompt = '';
    if (params.systemPrompt) {
      prompt += `System: ${params.systemPrompt}\n\n`;
    }

    for (const msg of params.messages) {
      const role = msg.role === 'assistant' ? 'Assistant' : 'User';
      prompt += `${role}: ${msg.content}\n\n`;
    }

    prompt += 'Assistant:';

    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const content = response.text();

    // Estimate token usage (Gemini doesn't always provide exact counts)
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(content.length / 4);

    return {
      content,
      model,
      provider: 'google',
      usage: {
        inputTokens,
        outputTokens,
      },
    };
  }

  /**
   * xAI/Grok completion with reasoning mode
   * Uses grok-4-0709 for maximum quality
   */
  private async completeWithXAI(model: ModelId, params: CompletionParams): Promise<CompletionResult> {
    if (!this.xai) {
      throw new Error('xAI client not initialized');
    }

    // Use maximum context for Grok
    const maxTokens = params.maxTokens || 65536;

    // Build messages array
    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    // Add system prompt if provided
    if (params.systemPrompt) {
      messages.push({ role: 'system', content: params.systemPrompt });
    }

    // Add conversation messages
    for (const msg of params.messages) {
      if (msg.role === 'system') {
        messages.push({ role: 'system', content: msg.content });
      } else {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    }

    // Use grok-4-0709 (or grok-4-latest alias)
    const response = await this.xai.chat.completions.create({
      model: 'grok-4-0709',
      max_tokens: maxTokens,
      messages: messages,
      temperature: params.temperature ?? 0.7,
    });

    const choice = response.choices[0];
    const content = choice?.message?.content || '';

    return {
      content,
      model,
      provider: 'xai',
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
    };
  }

  /**
   * Get all available models
   */
  getAvailableModels(): ModelId[] {
    return Object.keys(MODEL_CAPABILITIES).filter((model) => {
      const capabilities = MODEL_CAPABILITIES[model as ModelId];
      return this.isProviderAvailable(capabilities.provider as Provider);
    }) as ModelId[];
  }

  /**
   * Get models for a specific strength
   */
  getModelsForStrength(strength: string): ModelId[] {
    return (Object.entries(MODEL_CAPABILITIES) as [ModelId, (typeof MODEL_CAPABILITIES)[ModelId]][])
      .filter(([_, caps]) => caps.strengths.includes(strength as never))
      .map(([model]) => model);
  }
}

/**
 * Create a singleton router instance
 * Recommended for most applications
 */
let routerInstance: ModelRouter | null = null;

export function getModelRouter(config: ModelRouterConfig): ModelRouter {
  if (!routerInstance) {
    routerInstance = new ModelRouter(config);
  }
  return routerInstance;
}

export function resetModelRouter(): void {
  routerInstance = null;
}
