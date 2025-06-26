// lib/llm-factory.ts
import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';
//import { ChatOpenAI } from "langchain/chat_models/openai"
import { ChatDeepSeek } from '@langchain/deepseek';
import {OPENAI_API_KEY} from "@/lib/constant/token-key"; // You'll need to install @langchain/deepseek

// Define your supported AI providers
export type LLMProvider = 'ollama' | 'openai' | 'deepseek' | 'openrouter'; // Add more as needed

// Base interface for common model config
interface BaseModelConfig {
    temperature?: number;
    maxRetries?: number;
    // Add other common parameters
}

// Specific configurations for each provider (can extend BaseModelConfig)
interface OllamaConfig extends BaseModelConfig {
    //baseUrl?: string;
    // Ollama specific
}

interface OpenAIConfig extends BaseModelConfig {
    // OpenAI specific, e.g., organization, timeout
    //organization?: string;
}

interface DeepSeekConfig extends BaseModelConfig {
    // DeepSeek specific
}

interface OpenRouterConfig extends BaseModelConfig {
    // DeepSeek specific
}

// A union type for all possible configurations
export type LLMConfig = OllamaConfig | OpenAIConfig | DeepSeekConfig | OpenRouterConfig;

// A map to store initialized model instances, keyed by a unique identifier
const modelInstances = new Map<string, any>(); // Use 'any' or a more complex union type for ChatModel instances

/**
 * Generates a unique cache key for a model based on its provider, name, and configuration.
 * This ensures that models with different settings (e.g., temperature) get different instances.
 */
function generateModelCacheKey(
    provider: LLMProvider,
    modelName: string,
    config: LLMConfig
): string {
    // Sort keys for consistent cache key generation
    const sortedConfig = Object.keys(config)
        .sort()
        .reduce((acc, key) => ({ ...acc, [key]: (config as any)[key] }), {});
    return `${provider}-${modelName}-${JSON.stringify(sortedConfig)}`;
}

/**
 * Retrieves or creates a LangChain Chat Model instance for various providers.
 *
 * @param provider The AI provider ('ollama', 'openai', 'deepseek', etc.).
 * @param modelName The specific model name (e.g., 'gpt-3.5-turbo', 'deepseek-r1:1.5b', 'llama3').
 * @param config Optional: Specific configuration for this model instance (e.g., temperature, baseUrl).
 * @returns A LangChain ChatModel instance.
 */
export function getChatModel(
    provider: LLMProvider,
    modelName: string = "",
    config: LLMConfig = {} // Default empty config
): any { // Return type is 'any' because it can be ChatOllama, ChatOpenAI, etc.
    const cacheKey = generateModelCacheKey(provider, modelName, config);

    if (modelInstances.has(cacheKey)) {
        console.log(`Returning cached model instance for: ${cacheKey}`);
        return modelInstances.get(cacheKey)!;
    }

    console.log(`Creating new model instance for: ${cacheKey}`);
    let modelInstance;

    switch (provider) {
        case 'ollama':
            const ollamaConfig = config as OllamaConfig;
            /*if (!ollamaConfig.baseUrl) {
                ollamaConfig.baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
            }*/
            modelInstance = new ChatOllama({
                model: modelName,
                //baseUrl: ollamaConfig.baseUrl,
                temperature: ollamaConfig.temperature ?? 0.1,
                maxRetries: ollamaConfig.maxRetries ?? 2,
                // Add other Ollama-specific options from config
            });
            break;

        case 'openai':
            const openAiConfig = config as OpenAIConfig;
            if (!process.env.OPENAI_API_KEY) {
                throw new Error("OPENAI_API_KEY environment variable is not set for OpenAI models.");
            }
            modelInstance = new ChatOpenAI({
                modelName: modelName, // OpenAI uses modelName
                temperature: openAiConfig.temperature ?? 0.7, // OpenAI default temp often higher
                maxRetries: openAiConfig.maxRetries ?? 2,
                //openAIApiKey: process.env.OPENAI_API_KEY, // Explicitly pass key if needed, or it auto-detects
                // Add other OpenAI-specific options from config
            });
            break;

        case 'deepseek':
            const deepseekConfig = config as DeepSeekConfig;
            const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

            if (!deepseekApiKey) {
                throw new Error("DEEPSEEK_API_KEY environment variable is not set for DeepSeek models.");
            }

            modelInstance = new ChatDeepSeek({
                model: modelName,
                temperature: deepseekConfig.temperature ?? 0.1,
                maxRetries: deepseekConfig.maxRetries ?? 2,
                apiKey: deepseekApiKey, // ✅ Gunakan `apiKey` yang sesuai dengan LangChain
                configuration: {
                    baseURL: "https://api.deepseek.com",
                },
                streaming: true,
                verbose: true
            });
            break;


        case 'openrouter':
            /*if (!process.env.DEEPSEEK_API_KEY) {
                throw new Error("DEEPSEEK_API_KEY environment variable is not set for DeepSeek models.");
            }*/
            const openrouterConfig = config as OpenRouterConfig;
            modelInstance = new ChatOpenAI({
                // model: "deepseek/deepseek-r1-0528:free",
                // temperature: 0.9,
                model: modelName,
                temperature: openrouterConfig.temperature ?? 0.7,
                configuration: {
                    baseURL: "https://openrouter.ai/api/v1",
                },
                openAIApiKey: OPENAI_API_KEY,
                //maxRetries: 2,
                streaming: true,
                verbose: true
            });
        break;

        default:
            throw new Error(`Unsupported LLM provider: ${provider}`);
    }

    modelInstances.set(cacheKey, modelInstance);
    return modelInstance;
}