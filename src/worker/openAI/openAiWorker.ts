import {ResponseWorker} from "../iResponseWorker";
import {createContext} from "./context";
import {Actions} from "../../telegram/iActions";
import {isEmoji} from "../../utils/isEmoji";
import {generateImageResponse} from "./generateImageResponse";
import {isImageRequest} from "./isImageRequest";
import {openAiProvider} from "../../provider/openAiProvider";


function openAiWorker(openaiAiKey: string): ResponseWorker {
  let openAiContext: ReturnType<typeof createContext>;
  openAiContext = createContext().loadFromFile("output.json");

  const aiProvider = openAiProvider(openaiAiKey);


  const generateChatResponse = async (prompt: string, actions: Actions, asService: boolean = false) => {
    const typer = setInterval(actions.setTyping, 100);
    let answer = await aiProvider.chat(prompt, openAiContext, asService);
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
        // if (Math.random() < 0.15) {
        //   this.generateResponse("Учтя свой предыдущий ответ, продолжи развивать тему дальше, расшевели диалог", actions, true);
        // }
      }
    }
  };

  return Object.freeze({
    async generateResponse(prompt: string, actions: Actions, asService: boolean = false) {
      actions.markRead();
      if (await isImageRequest(prompt, aiProvider)) {
        await generateImageResponse(prompt, actions, aiProvider);
      } else {
        await generateChatResponse(prompt, actions, asService);
      }
    }
  });
}

export {openAiWorker};
