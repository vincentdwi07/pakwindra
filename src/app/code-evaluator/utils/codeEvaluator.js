// File: /utils/codeEvaluator.js
import { ChatOllama } from '@langchain/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { generateTestCases } from './testCaseGenerator';
import {getOllamaModel} from "@/app/code-evaluator/lib/ollamaInstance";

export async function evaluateCode(code, fileName, question) {
    console.log("Agent start analyzing the code...");

    console.log("Start generating test cases...");
    // Generate test cases based on the question
    const testCases = await generateTestCases(question);
    console.log("Test cases generated...");

    console.log("Start evaluating code...");
    // Initialize the Ollama model
    const model = getOllamaModel();

    console.log("Creating prompt template and chain...");

    // Create prompt template for code evaluation
    const promptTemplate = PromptTemplate.fromTemplate(`
You are a code evaluation agent for programming assignments in Indonesian language. 
Your task is to evaluate and determined whether correct or incorrect that
student's Python code as solution on given question or instruction and test cases.

QUESTION:
{question}

SUBMITTED STUDENT'S CODE (from {fileName}):
\`\`\`python
{code}
\`\`\`

TEST CASES:
{testCases}

Your task is to:

1. Analyze if the submitted code correctly implements the requirements from the question
2. Run through the test cases and check if the output matches the expected results
3. Identify any errors or bugs in the code
4. Provide specific feedback on what's wrong and how to fix it
5. Suggest improvements for code quality, efficiency, and best practices
6. Make a final judgment on whether the submission is correct or incorrect
`);
    console.log(promptTemplate)
    console.log("Prompt template created...");

    // Create a chain that will format the prompt and pass it to the model
    const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
    ]);
    console.log("Chain created...");

    // Execute the chain with the provided input
    console.log("Executing chain...");
    const response = await chain.invoke({
        code,
        fileName,
        question,
        testCases
    });
    console.log("Response received..." + response);

    // Parse the response as JSON
    try {
        // Extract just the JSON part in case the model includes other text
        console.log("Parsing response ...");
        // Remove the <think>...</think> section
        const cleanedResponse = response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        const jsonMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);

        let evaluationResult;

        if (jsonMatch) {
            // We found JSON in a code block
            try {
                evaluationResult = JSON.parse(jsonMatch[1]);
                console.log("JSON parsed from code block");
            } catch (innerError) {
                // If parsing the code block content fails, return it as text
                console.log("Code block content isn't valid JSON, treating as text");
                evaluationResult = cleanedResponse;
            }
        } else {
            // No code block, try to parse the whole response as JSON
            try {
                evaluationResult = JSON.parse(cleanedResponse);
                console.log("Full response parsed as JSON");
            } catch (innerError) {
                // If that fails too, just return the cleaned text
                console.log("Response isn't JSON, treating as text");
                evaluationResult = cleanedResponse;
            }
        }

        console.log("Code successfully evaluated!");
        return evaluationResult;

    } catch (error) {
        console.error("Error processing model response:", error);
        // Return the raw response as text instead of throwing
        throw new Error("Failed to parse evaluation results");
    }
}