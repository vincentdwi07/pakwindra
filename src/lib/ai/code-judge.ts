// UNTUK MENYIMPULKAN isCorrect == 1 || 0

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import {PROMPT_JUDGE_RESULT} from "@/lib/constant/ai-prompt";
import {ChatOllama} from "@langchain/ollama";
// import { BaseChatModel } from '@langchain/core/language_models/chat_models';

// TODO : unused
export async function codeJudge(feedback: string, model: ChatOllama) {
    console.log("AI starting JUDGING the result based on received feedback...")
    // Create prompt template for test case generation
    const promptTemplate = PromptTemplate.fromTemplate(PROMPT_JUDGE_RESULT);

    // Create a chain that will format the prompt and pass it to the model
    console.log("Creating chain...");
    const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
    ]);

    // Execute the chain with the provided input
    console.log("Executing chain...");
    const rawResponse = await chain.invoke({
        feedback: feedback
    });
    console.log("Raw Response received from judge:" + rawResponse);

    let parsedResult: number | null = null;
    try {
        const trimmedResponse = rawResponse.trim();
        if (trimmedResponse === '1') {
            parsedResult = 1;
        } else if (trimmedResponse === '0') {
            parsedResult = 0;
        } else {
            console.warn(`AI Judge returned non-binary output: "${trimmedResponse}". Defaulting to 0.`);
            parsedResult = 0; // Default to incorrect if AI output is invalid
        }
    } catch (parseError) {
        console.error("Error parsing AI judge response to 0 or 1:", parseError);
        parsedResult = 0; // Default to incorrect on parsing error
    }

    return parsedResult;
}