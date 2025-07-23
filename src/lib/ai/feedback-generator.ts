// import { PromptTemplate } from '@langchain/core/prompts';
// import { StringOutputParser } from '@langchain/core/output_parsers';
// import { RunnableSequence } from '@langchain/core/runnables';
// // import { getModelAI } from "@/lib/ai/ollama-instance";
// import {PROMPT_CONTEXT, PROMPT_CONTEXT_INDO} from "@/lib/constant/ai-prompt";
// import {ChatOllama} from "@langchain/ollama";
// import { CallbackManager } from "@langchain/core/callbacks/manager";
// // import { BaseChatModel } from '@langchain/core/language_models/chat_models';

// function parseScoreFromFeedback(feedback: string): number | null {
//   const match = feedback.match(/Score:\s*(\d{1,3})/i);
//   if (match) {
//     const score = parseInt(match[1]);
//     if (!isNaN(score) && score >= 0 && score <= 100) {
//       return score;
//     }
//   }
//   return null;
// }

// function removeScoreFromFeedback(feedback: string): string {
//   return feedback.replace(/Score:\s*\d{1,3}/i, '').trim();
// }

// export async function feedbackGenerator(
//   code: string,
//   question: string,
//   model: ChatOllama,
//   rubrik: string,
//   language: string
// ) {
//   console.log("AI starting to analyse code...");
//   const promptTemplate = PromptTemplate.fromTemplate(PROMPT_CONTEXT_INDO);

//   let tokenUsage = {
//     promptTokens: 0,
//     completionTokens: 0,
//     totalTokens: 0
//   };

//   const chain = RunnableSequence.from([
//     promptTemplate,
//     model,
//     new StringOutputParser(),
//   ]);

//   console.log("Executing chain...");

//   const response = await chain.invoke({
//     code,
//     question,
//     rubrik,
//     language,
//   });
//   console.log("Raw response:\n", response);


  
//   try {
//     const cleanedFromThink = response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
//     const score = parseScoreFromFeedback(cleanedFromThink);
//     const feedbackOnly = removeScoreFromFeedback(cleanedFromThink);

//     console.log("Final Feedback:", feedbackOnly);
//     console.log("Extracted Score:", score);

//     return {
//       feedback: feedbackOnly,
//       score: score
//     };

//   } catch (error) {
//     console.error("Error processing model response:", error);
//     throw new Error("Failed to parse evaluation results");
//   }
// }


//TESTING

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { PROMPT_CONTEXT_INDO } from "@/lib/constant/ai-prompt";
import { ChatDeepSeek } from '@langchain/deepseek';
import { CallbackManager } from "@langchain/core/callbacks/manager";

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
  model: ChatDeepSeek,
  rubrik: string,
  language: string
) {
  console.log("AI starting to analyse code...");
  
  // Menyiapkan variabel untuk token usage
  let tokenUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0
  };

  const callbackManager = CallbackManager.fromHandlers({
    handleLLMEnd: (output) => {
      try {
        // Cara yang lebih type-safe untuk mendapatkan token usage
        const usage = output.llmOutput?.estimatedTokenUsage || 
                     (output.generations?.[0]?.[0] as any)?.message?.kwargs?.usage_metadata ||
                     (output.generations?.[0]?.[0] as any)?.message?.kwargs?.response_metadata?.usage;
        
        if (usage) {
          tokenUsage = {
            promptTokens: usage.input_tokens || usage.promptTokens || 0,
            completionTokens: usage.output_tokens || usage.completionTokens || 0,
            totalTokens: usage.total_tokens || usage.totalTokens || 0
          };
        }
      } catch (error) {
        console.error("Error tracking token usage:", error);
      }
    },
  });

  const promptTemplate = PromptTemplate.fromTemplate(PROMPT_CONTEXT_INDO);
  
  const chain = RunnableSequence.from([
    promptTemplate,
    model.bind({ callbacks: callbackManager }),
    new StringOutputParser(),
  ]);

  console.log("Executing chain...");
  const response = await chain.invoke({
    code,
    question,
    rubrik,
    language,
  });

  console.log("Token usage details:", tokenUsage);
  console.log("Raw response:", response);

  try {
    const cleanedFromThink = response.replace(/[\s\S]*?<\/think>/g, "").trim();
    const score = parseScoreFromFeedback(cleanedFromThink);
    const feedbackOnly = removeScoreFromFeedback(cleanedFromThink);

    return {
      feedback: feedbackOnly,
      score: score,
      tokenUsage: tokenUsage
    };

  } catch (error) {
    console.error("Error processing model response:", error);
    throw new Error("Failed to parse evaluation results");
  }
}