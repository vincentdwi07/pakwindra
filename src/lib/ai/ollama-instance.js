import { ChatOllama } from '@langchain/ollama';

// Singleton pattern to maintain a single instance of the Ollama model
let ollamaModelInstance = null;

export function getOllamaModel() {
    if (!ollamaModelInstance) {
        console.log("Creating new Ollama model instance...");
        ollamaModelInstance = new ChatOllama({
            //baseUrl: process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || "http://localhost:11434",
            // model: "deepseek-r1:7b",
            model: "deepseek-r1:1.5b",
            temperature: 0.1,
            maxRetries: 2,
        });
    }
    return ollamaModelInstance;
}