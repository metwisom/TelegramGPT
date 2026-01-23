import {openAiProvider} from "../../provider/openAiProvider";
import {config} from "../../config";


/**
 * AI decides whether to use a reaction or text response
 * Returns an array with one emoji reaction if reaction should be used, empty array if text response should be used
 */
const getReactions = async (prompt: string, provider: ReturnType<typeof openAiProvider>) => {
  // Define a safe list of emojis that are guaranteed to work with Telegram
  // Using only the most basic, widely supported emojis
  const SAFE_EMOJIS = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '🤔', '👏', '🙏'];

  const decisionPrompt = `You are an intelligent assistant. Your task is to decide whether to respond with an emoji reaction or a text message.

Message to analyze: "${prompt}"

Analyze the message and decide:
- Use an EMOJI REACTION ONLY if:
  * The message is funny, humorous, or contains a joke
  * The message is clearly meant to be amusing or entertaining
  * A simple laugh or amused reaction is the most appropriate response
  
- Use a TEXT MESSAGE for ALL other cases:
  * Questions that require answers
  * Requests for information, help, or explanation
  * Statements that deserve a thoughtful response
  * Direct inquiries or requests
  * Any message that is not clearly funny or humorous

Choose ONLY ONE from these emojis for reactions: 👍, 👎, ❤️, 😂, 😮, 😢, 😡, 🎉, 🔥, 👏, 🙏

Respond with ONLY one of these formats:
- A single emoji (e.g., "😂") - if the message is funny and you want to react with an emoji
- "text" - for all other cases (respond with a text message)

Do not include any other text, explanations, or formatting.`;

  const answer = await provider.chat(decisionPrompt, undefined, false, config.temperature);
  const cleanedAnswer = answer.trim();
  
  console.log(`Reaction vs Text decision: ${cleanedAnswer} for message: "${prompt.substring(0, 50)}..."`);
  
  if (cleanedAnswer.toLowerCase() === "text" || cleanedAnswer === "") {
    console.log(`Will use text response`);
    return [];
  }
  
  // Validate emoji - ensure it's in the safe list
  if (SAFE_EMOJIS.includes(cleanedAnswer)) {
    console.log(`Will use emoji reaction: ${cleanedAnswer}`);
    return [cleanedAnswer];
  }
  
  console.log(`Invalid response, defaulting to text`);
  return [];
};

export {getReactions};
