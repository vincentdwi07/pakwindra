import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
// import { getModelAI } from "@/lib/ai/ollama-instance";
import {PROMPT_CONTEXT, PROMPT_CONTEXT_INDO} from "@/lib/constant/ai-prompt";
import {ChatOllama} from "@langchain/ollama";
// import { BaseChatModel } from '@langchain/core/language_models/chat_models';

function parseScoreFromFeedback(feedback: string): number | null {
  const match = feedback.match(/Score:\s*(\d{1,3})/i);
  if (match) {
    const score = parseInt(match[1]);
    if (!isNaN(score) && score >= 0 && score <= 100) {
      return score;
    }
  }
  return null;
}

function removeScoreFromFeedback(feedback: string): string {
  return feedback.replace(/Score:\s*\d{1,3}/i, '').trim();
}

export async function feedbackGenerator(
  code: string,
  question: string,
  model: ChatOllama,
  rubrik: string,
  language: string
) {
  console.log("AI starting to analyse code...");
  const promptTemplate = PromptTemplate.fromTemplate(PROMPT_CONTEXT_INDO);

  const chain = RunnableSequence.from([
    promptTemplate,
    model,
    new StringOutputParser(),
  ]);

  console.log("Executing chain...");
  const response = await chain.invoke({
    code,
    question,
    rubrik,
    language,
  });
  console.log("Raw response:\n", response);

  try {
    const cleanedFromThink = response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    const score = parseScoreFromFeedback(cleanedFromThink);
    const feedbackOnly = removeScoreFromFeedback(cleanedFromThink);

    console.log("Final Feedback:", feedbackOnly);
    console.log("Extracted Score:", score);

    return {
      feedback: feedbackOnly,
      score: score
    };

  } catch (error) {
    console.error("Error processing model response:", error);
    throw new Error("Failed to parse evaluation results");
  }
}