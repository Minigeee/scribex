import { z } from 'zod';

/**
 * Configuration for AI model providers
 */
export type AIModelProvider = 'openai' | 'anthropic' | 'mistral' | 'google' | 'groq' | 'custom';

/**
 * Base configuration for AI models
 */
export interface AIModelConfig {
  provider: AIModelProvider;
  apiKey: string;
  baseUrl?: string;
  modelName: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * OpenAI specific configuration
 */
export interface OpenAIConfig extends AIModelConfig {
  provider: 'openai';
  modelName: string; // e.g., 'gpt-4', 'gpt-3.5-turbo'
}

/**
 * Google Gemini specific configuration
 */
export interface GoogleConfig extends AIModelConfig {
  provider: 'google';
  modelName: string; // e.g., 'gemini-1.5-pro', 'gemini-2.0-flash'
}

/**
 * Groq specific configuration
 */
export interface GroqConfig extends AIModelConfig {
  provider: 'groq';
  modelName: string; // e.g., 'llama3-70b-8192', 'mixtral-8x7b-32768'
}

/**
 * Anthropic specific configuration
 */
export interface AnthropicConfig extends AIModelConfig {
  provider: 'anthropic';
  modelName: string; // e.g., 'claude-3-opus', 'claude-3-sonnet'
}

/**
 * Mistral specific configuration
 */
export interface MistralConfig extends AIModelConfig {
  provider: 'mistral';
  modelName: string; // e.g., 'mistral-large', 'mistral-small'
}

/**
 * Custom provider configuration
 */
export interface CustomConfig extends AIModelConfig {
  provider: 'custom';
  headers?: Record<string, string>;
}

/**
 * Union type of all model configurations
 */
export type ModelConfig = OpenAIConfig | AnthropicConfig | MistralConfig | GoogleConfig | GroqConfig | CustomConfig;

/**
 * Message role types
 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'function';

/**
 * Message structure following OpenAI's chat format
 */
export interface Message {
  role: MessageRole;
  content: string;
  name?: string;
}

/**
 * Options for text completion
 */
export interface CompletionOptions {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  stopSequences?: string[];
}

/**
 * Response structure for text completion
 */
export interface CompletionResponse {
  id: string;
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Validation schema for environment variables
 */
export const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  DEFAULT_AI_PROVIDER: z.enum(['openai', 'anthropic', 'mistral', 'google', 'groq', 'custom']).default('openai'),
  DEFAULT_AI_MODEL: z.string().default('gpt-3.5-turbo'),
});

/**
 * Default configurations for different providers
 */
export const defaultConfigs: Record<AIModelProvider, Omit<AIModelConfig, 'apiKey'>> = {
  openai: {
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
  },
  anthropic: {
    provider: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    modelName: 'claude-3-haiku',
    maxTokens: 1000,
    temperature: 0.7,
  },
  mistral: {
    provider: 'mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    modelName: 'mistral-small',
    maxTokens: 1000,
    temperature: 0.7,
  },
  google: {
    provider: 'google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    modelName: 'gemini-2.0-flash',
    maxTokens: 1000,
    temperature: 0.7,
  },
  groq: {
    provider: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    modelName: 'llama3-70b-8192',
    maxTokens: 1000,
    temperature: 0.7,
  },
  custom: {
    provider: 'custom',
    modelName: 'custom-model',
    maxTokens: 1000,
    temperature: 0.7,
  },
};

/**
 * Creates a completion request payload based on provider
 */
function createCompletionPayload(
  config: ModelConfig,
  options: CompletionOptions
): Record<string, any> {
  const { provider, maxTokens, temperature } = config;
  const { messages, stopSequences, stream } = options;

  // Use options values if provided, otherwise fall back to config values
  const finalMaxTokens = options.maxTokens ?? maxTokens;
  const finalTemperature = options.temperature ?? temperature;

  switch (provider) {
    case 'openai':
    case 'google':
    case 'groq':
      // Google and Groq use the OpenAI API format
      return {
        model: config.modelName,
        messages,
        max_tokens: finalMaxTokens,
        temperature: finalTemperature,
        stream,
        stop: stopSequences,
      };
    case 'anthropic':
      return {
        model: config.modelName,
        messages,
        max_tokens: finalMaxTokens,
        temperature: finalTemperature,
        stream,
        stop_sequences: stopSequences,
      };
    case 'mistral':
      return {
        model: config.modelName,
        messages,
        max_tokens: finalMaxTokens,
        temperature: finalTemperature,
        stream,
        stop: stopSequences,
      };
    case 'custom':
      return {
        model: config.modelName,
        messages,
        max_tokens: finalMaxTokens,
        temperature: finalTemperature,
        stream,
        stop: stopSequences,
      };
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Get the appropriate endpoint URL based on provider
 */
function getEndpointUrl(config: ModelConfig): string {
  const { provider, baseUrl } = config;
  
  if (!baseUrl) {
    switch (provider) {
      case 'openai':
        return 'https://api.openai.com/v1/chat/completions';
      case 'anthropic':
        return 'https://api.anthropic.com/v1/messages';
      case 'mistral':
        return 'https://api.mistral.ai/v1/chat/completions';
      case 'google':
        return 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
      case 'groq':
        return 'https://api.groq.com/openai/v1/chat/completions';
      case 'custom':
        throw new Error('baseUrl is required for custom provider');
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  switch (provider) {
    case 'openai':
    case 'mistral':
    case 'google':
    case 'groq':
      return `${baseUrl}/chat/completions`;
    case 'anthropic':
      return `${baseUrl}/messages`;
    case 'custom':
      return baseUrl;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Get request headers based on provider
 */
function getHeaders(config: ModelConfig): Record<string, string> {
  const { provider, apiKey } = config;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  switch (provider) {
    case 'openai':
    case 'mistral':
    case 'google':
    case 'groq':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'anthropic':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      break;
    case 'custom':
      headers['Authorization'] = `Bearer ${apiKey}`;
      if ((config as CustomConfig).headers) {
        Object.assign(headers, (config as CustomConfig).headers);
      }
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  return headers;
}

/**
 * Parse the completion response based on provider
 */
function parseCompletionResponse(
  provider: AIModelProvider,
  modelName: string,
  data: any
): CompletionResponse {
  switch (provider) {
    case 'openai':
    case 'groq':
    case 'google':
      // Google and Groq follow the OpenAI response format
      return {
        id: data.id,
        text: data.choices[0].message.content,
        model: modelName,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
      };
    case 'anthropic':
      return {
        id: data.id,
        text: data.content[0].text,
        model: modelName,
        usage: data.usage
          ? {
              promptTokens: data.usage.input_tokens,
              completionTokens: data.usage.output_tokens,
              totalTokens: data.usage.input_tokens + data.usage.output_tokens,
            }
          : undefined,
      };
    case 'mistral':
      return {
        id: data.id,
        text: data.choices[0].message.content,
        model: modelName,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    case 'custom':
      // For custom providers, we assume a similar structure to OpenAI
      // but this can be customized based on the actual response format
      return {
        id: data.id || 'custom-id',
        text: data.choices?.[0]?.message?.content || data.text || '',
        model: modelName,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens || 0,
              completionTokens: data.usage.completion_tokens || 0,
              totalTokens: data.usage.total_tokens || 0,
            }
          : undefined,
      };
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Create a model configuration from environment variables or defaults
 */
export function createModelConfig(
  provider?: AIModelProvider,
  modelName?: string,
  apiKey?: string,
  baseUrl?: string
): ModelConfig {
  // Try to parse environment variables
  let env;
  try {
    env = envSchema.parse(process.env);
  } catch (error) {
    console.warn('Failed to parse environment variables for AI configuration');
    env = {
      DEFAULT_AI_PROVIDER: 'google' as AIModelProvider,
      DEFAULT_AI_MODEL: 'gemini-2.0-flash',
    };
  }

  // Determine provider
  const finalProvider = provider || (env.DEFAULT_AI_PROVIDER as AIModelProvider);

  // Get default config for the provider
  const defaultConfig = defaultConfigs[finalProvider];

  // Determine API key based on provider
  let finalApiKey = apiKey;
  if (!finalApiKey) {
    switch (finalProvider) {
      case 'openai':
        finalApiKey = env.OPENAI_API_KEY || '';
        break;
      case 'anthropic':
        finalApiKey = env.ANTHROPIC_API_KEY || '';
        break;
      case 'mistral':
        finalApiKey = env.MISTRAL_API_KEY || '';
        break;
      case 'google':
        finalApiKey = env.GOOGLE_API_KEY || '';
        break;
      case 'groq':
        finalApiKey = env.GROQ_API_KEY || '';
        break;
      default:
        finalApiKey = '';
    }
  }

  if (!finalApiKey) {
    throw new Error(`API key not provided for ${finalProvider}`);
  }

  // Create the final config
  return {
    ...defaultConfig,
    apiKey: finalApiKey,
    modelName: modelName || env.DEFAULT_AI_MODEL || defaultConfig.modelName,
    baseUrl: baseUrl || defaultConfig.baseUrl,
  } as ModelConfig;
}

/**
 * Main function to generate text completions
 */
export async function generateCompletion(
  options: CompletionOptions,
  configOptions?: Partial<ModelConfig>
): Promise<CompletionResponse> {
  // Create model config
  const config = createModelConfig(
    configOptions?.provider,
    configOptions?.modelName,
    configOptions?.apiKey,
    configOptions?.baseUrl
  );

  // Get endpoint URL and headers
  const url = getEndpointUrl(config);
  const headers = getHeaders(config);

  // Create request payload
  const payload = createCompletionPayload(config, options);

  try {
    // Make the API request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `AI provider error (${response.status}): ${
          errorData?.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();
    return parseCompletionResponse(config.provider, config.modelName, data);
  } catch (error) {
    console.error('Error generating completion:', error);
    throw error;
  }
}

/**
 * Helper function to create a system message
 */
export function systemMessage(content: string): Message {
  return { role: 'system', content };
}

/**
 * Helper function to create a user message
 */
export function userMessage(content: string): Message {
  return { role: 'user', content };
}

/**
 * Helper function to create an assistant message
 */
export function assistantMessage(content: string): Message {
  return { role: 'assistant', content };
}

/**
 * Helper function to create a function message
 */
export function functionMessage(content: string, name: string): Message {
  return { role: 'function', content, name };
} 