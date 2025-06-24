import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
// import { getModelAI } from "@/lib/ai/ollama-instance";
import {PROMPT_CONTEXT, PROMPT_CONTEXT_INDO} from "@/lib/constant/ai-prompt";
import {ChatOllama} from "@langchain/ollama";
// import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export async function feedbackGenerator(code:string, question:string, model:ChatOllama) {
    console.log("AI starting to analyse code...")
    const promptTemplate = PromptTemplate.fromTemplate(PROMPT_CONTEXT_INDO);

    // Create a chain that will format the prompt and pass it to the model
    console.log("Creating chain...");
    const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
    ]);

    console.log("Executing chain...");
    const response = await chain.invoke({
        code,
        question,
    });
    console.log("Response received...\n" + response);

    try {
        console.log("Parsing response ...");
        // Buat menghapus kata kata "think"
        const cleanedResponse = response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        console.log("evaluationResult:", cleanedResponse);
        console.log("Code successfully evaluated!");
        return cleanedResponse;

    } catch (error) {
        console.error("Error processing model response:", error);
        // Return the raw response as text instead of throwing
        throw new Error("Failed to parse evaluation results");
    }
}