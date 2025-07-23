import {feedbackGenerator} from "@/lib/ai/feedback-generator";
import {codeJudge} from "@/lib/ai/code-judge";
import {getChatModel} from "@/lib/ai/model-instance";

export async function evaluateCode(code:string, question:string, rubrik:string, language:string) {
    const model = getChatModel("deepseek", "deepseek-chat", {temperature: 0.0});
    // const model = getChatModel("openrouter", "deepseek/deepseek-r1-0528:free", {temperature: 0.1});

    try {
        const { feedback, score, tokenUsage } = await feedbackGenerator(code, question, model, rubrik, language);
        // const codeResultNumber: number = await codeJudge(feedback, model);

        // Return both the feedback string and the boolean result
        return {
            aiResponse: feedback,
            // isCorrect: codeResultNumber === 1, // Convert number to boolean here
            score: score,
            token: tokenUsage
        };

    } catch (error) {
        console.error("Error processing model response in evaluateCode:", error);
        throw new Error("Failed to evaluate code");
    }
}