import {ResponseWorker} from "../../types/ResponseWorker.type";
import {createContext} from "./context";
import {Actions} from "../../types/Actions.type";
import {isEmoji} from "../../utils/isEmoji";
import {generateImageResponse} from "./generateImageResponse";
import {isImageRequest} from "./isImageRequest";
import {shouldRespond} from "./shouldRespond";
import {getReactions} from "./getReactions";
import {openAiProvider} from "../../provider/openAiProvider";
import {config} from "../../config";


function openAiWorker(openaiAiKey: string): ResponseWorker {
  let openAiContext: ReturnType<typeof createContext>;
  openAiContext = createContext().loadFromFile("output.json");

  const aiProvider = openAiProvider(config.openAiHost ?? '', openaiAiKey);


  const generateChatResponse = async (prompt: string, actions: Actions, asService: boolean = false) => {
    const typer = setInterval(actions.setTyping, 100);
    let answer = await aiProvider.chat(prompt, openAiContext, asService, config.temperature);
    answer = answer.split("Не синхронизировано:")[1] ?? answer;

    clearInterval(typer);

    openAiContext
      .add([{role: asService ? "system" : "user", content: prompt}])
      .add([{role: "assistant", content: answer}]);
    const codePoint = answer.codePointAt(0);
    if (isEmoji(codePoint)) {
      actions.sendEmoji(answer);
    } else {
      if (answer != "-пропуск-") {
        actions.sendMessage(answer);
      }
    }
  };

  return Object.freeze({
    async generateResponse(prompt: string, actions: Actions, forceRespond: boolean = false) {
      // Always mark as read
      actions.markRead();
      
      try {
        // AI decides whether to respond to the message (unless forced)
        const shouldReply = forceRespond || await shouldRespond(prompt, aiProvider);
        
        if (!shouldReply) {
          return; // Don't respond at all
        }
        
        // AI decides which reaction to use (returns empty array if no reaction)
        const reactions = await getReactions(prompt, aiProvider);
        
        if (reactions.length > 0) {
          // Use reaction instead of text response
          actions.sendReactions(reactions);
        } else {
          // Generate text response
          // if (await isImageRequest(prompt, aiProvider)) {
          //   await generateImageResponse(prompt, actions, aiProvider);
          // } else {
            await generateChatResponse(prompt, actions, false);
          // }
        }
      } catch (error) {
        console.error('Error in generateResponse:', error);
      }
    }
  });
}

export {openAiWorker};
