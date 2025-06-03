// lib/ollama-langchain.js
//import { Ollama } from "@langchain/community/llms/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import {Ollama} from "@langchain/ollama";

// Inisialisasi Ollama dengan LangChain
const ollama = new Ollama({
    baseUrl: "http://localhost:11436",
    model: "deepseek-r1:1.5b",
    temperature: 0.1,
});

// Schema untuk output yang terstruktur
const evaluationSchema = z.object({
    isCorrect: z.boolean().describe("Whether the code is correct"),
    feedback: z.string().describe("Detailed feedback about the code")
});

const parser = StructuredOutputParser.fromZodSchema(evaluationSchema);

// Template prompt
const promptTemplate = PromptTemplate.fromTemplate(`
    As an AI teaching assistant, evaluate this code submission carefully.

    INSTRUCTION:
    {instruction}

    STUDENT'S CODE:
    {answer}

    Evaluation Criteria:
    1. Code correctness (does it fulfill the requirements?)
    2. Code functionality (does it work as intended?)
    3. Code efficiency (is it well-optimized?)
    4. Code style (does it follow best practices?)

    Provide "isCorrect": true only if ALL criteria are met:
    - Code completely fulfills the instruction requirements
    - Code is functionally correct
    - Code has no major logical errors
    - Code follows basic best practices

    {format_instructions}`
);

export async function generateAIFeedback(instruction, answer) {
    try {
        if (!instruction || !answer) {
            throw new Error('Instruction and answer are required');
        }

        // Format prompt dengan instruksi parser
        const formattedPrompt = await promptTemplate.format({
            instruction,
            answer,
            format_instructions: parser.getFormatInstructions()
        });

        console.log('Formatted prompt:', formattedPrompt);

        // Generate response
        const response = await ollama.invoke(formattedPrompt);
        console.log('Raw AI response:', response);

        // Parse structured output
        const parsedResult = await parser.parse(response);
        console.log('Parsed result:', parsedResult);

        return parsedResult;

    } catch (error) {
        console.error('LangChain Ollama error:', error);
        
        // Fallback ke parsing manual jika structured parsing gagal
        try {
            const response = await ollama.invoke(`
                Evaluate this code submission and respond with JSON format:
                {"isCorrect": true/false, "feedback": "your feedback"}

                INSTRUCTION: ${instruction}
                STUDENT'S CODE: ${answer}
            `);

            // Extract JSON from response
            const jsonMatch = response.match(/\{.*\}/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (fallbackError) {
            console.error('Fallback parsing failed:', fallbackError);
            throw new Error('Failed to generate AI feedback');
        }
    }
}

// Alternative: Menggunakan Chain untuk workflow yang lebih kompleks
/*
export async function generateAIFeedbackWithChain(instruction, answer) {
    try {
        const { LLMChain } = await import("@langchain/core/chains");
        
        const chain = new LLMChain({
            llm: ollama,
            prompt: promptTemplate,
            outputParser: parser
        });

        const result = await chain.call({
            instruction,
            answer
        });

        return result;

    } catch (error) {
        console.error('Chain execution error:', error);
        throw new Error('Failed to execute AI feedback chain');
    }
}*/
