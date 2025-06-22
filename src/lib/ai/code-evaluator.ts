import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
//import { getModelAI } from "@/lib/ai/ollama-instance";
import { generateTestCases } from "@/lib/ai/test-case-generator";
import {PROMPT_CONTEXT} from "@/lib/constant/ai-prompt";
import {feedbackGenerator} from "@/lib/ai/feedback-generator";
import {codeJudge} from "@/lib/ai/code-judge";
import {getChatModel} from "@/lib/ai/model-instance";

export async function evaluateCode(code:string, question:string) {
    //const feedbackModel = getChatModel("deepseek", "deepseek-reasoner", { temperature: 0.7 }); // Or "deepseek-chat" for newer models
    //const judgeModel = getChatModel("openai", "gpt-3.5-turbo", { temperature: 0.0 }); // OpenAI for deterministic judge
    const model = getChatModel("openrouter", "tada");

    try {
        const feedback:string = await feedbackGenerator(code, question, model);

        const codeResultNumber: number = await codeJudge(feedback, model);

        // Return both the feedback string and the boolean result
        return {
            aiResponse: feedback,
            isCorrect: codeResultNumber === 1 // Convert number to boolean here
        };

    } catch (error) {
        console.error("Error processing model response in evaluateCode:", error);
        throw new Error("Failed to evaluate code");
    }
}