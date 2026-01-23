import {openAiProvider} from "../../provider/openAiProvider";
import {config} from "../../config";


/**
 * AI decides whether to respond to a message
 * Returns true if the AI should respond, false otherwise
 */
const shouldRespond = async (prompt: string, provider: ReturnType<typeof openAiProvider>) => {
  const decisionPrompt = `You are an intelligent assistant. Your task is to decide whether to respond to a message.

Message to analyze: "${prompt}"

Analyze the message and decide if it requires a response from you. Consider:
- ALWAYS respond if the message is directly addressing you (e.g., "ты", "тебе", "твой", "твоя", "твоё", "you", "your", asking for help, calling your name)
- Is the message asking a question?
- Is the message interesting or worth responding to?
- Is the message part of a conversation you should participate in?
- Would a response be helpful or engaging?

IMPORTANT: If someone is directly addressing you or asking you something, you MUST respond.

Respond with ONLY one of these exact words:
- "respond" - if you should respond to the message
- "ignore" - if you should ignore the message

Do not include any other text, explanations, or formatting.`;

  const answer = await provider.chat(decisionPrompt, undefined, false, config.temperature);
  const cleanedAnswer = answer.trim().toLowerCase().replace(/[^\w]/g, "");
  
  console.log(`Should respond decision: ${cleanedAnswer} for message: "${prompt.substring(0, 50)}..."`);
  
  return cleanedAnswer === "respond";
};

export {shouldRespond};
