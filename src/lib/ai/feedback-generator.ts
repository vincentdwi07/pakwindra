import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { getModelAI } from "@/lib/ai/ollama-instance";
import { generateTestCases } from "@/lib/ai/test-case-generator";
import {PROMPT_CONTEXT, PROMPT_CONTEXT_INDO} from "@/lib/constant/ai-prompt";
import {ChatOllama} from "@langchain/ollama";

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
        const cleanedResponse = response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        const jsonMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);
        console.log(`cleanedResponse: ${cleanedResponse} \n Response match: ${jsonMatch}`);

        let evaluationResult;

        if (jsonMatch) {
            try {
                evaluationResult = JSON.parse(jsonMatch[1]);
                console.log("JSON parsed from code block");
            } catch (innerError) {
                // If parsing the code block content fails, return it as text
                console.log("Code block content isn't valid JSON, treating as text");
                evaluationResult = cleanedResponse;
            }
        } else {
            try {
                evaluationResult = JSON.parse(cleanedResponse);
                console.log("Full response parsed as JSON");
            } catch (innerError) {
                // If that fails too, just return the cleaned text
                console.log("Response isn't JSON, treating as text");
                evaluationResult = cleanedResponse;
            }
        }

        console.log("evaluationResult:", evaluationResult);
        console.log("Code successfully evaluated!");
        return evaluationResult;

    } catch (error) {
        console.error("Error processing model response:", error);
        // Return the raw response as text instead of throwing
        throw new Error("Failed to parse evaluation results");
    }
}