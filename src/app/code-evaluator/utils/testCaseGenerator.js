// File: /utils/testCaseGenerator.js
import { ChatOllama } from '@langchain/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import {getOllamaModel} from "@/app/code-evaluator/lib/ollamaInstance";

export async function generateTestCases(question) {
    // Initialize the Ollama model
    const model = getOllamaModel();

    // Create prompt template for test case generation
    const promptTemplate = PromptTemplate.fromTemplate(`
You are a programming instructor assistant. Analyze the following programming question in Indonesian language and create appropriate test cases.

QUESTION:
{question}

First, analyze if this question requires test cases beyond what's given in the question itself. 
If the question already contains complete test data (like comparing specific arrays), you might not need additional test cases.

If additional test cases would be helpful, create up to 10 diverse test cases that cover:
1. Normal cases
2. Edge cases
3. Corner cases
4. Invalid inputs (if applicable)

Return your test cases in this format (do not include actual Python code, just the test data and expected results):

Test Case 1:
Input: [description of input]
Expected Output: [expected output]

Test Case 2:
Input: [description of input]
Expected Output: [expected output]

... and so on.

If additional test cases are not needed because the question already provides specific data to work with, explain why and provide a summary of what the question is asking.
`);

    // Create a chain that will format the prompt and pass it to the model
    const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
    ]);
    console.log("Chain created...");

    // Execute the chain with the provided input
    const response = await chain.invoke({
        question
    });
    console.log("Response received..." + response);

    return response;
}