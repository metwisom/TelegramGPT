import {Actions} from "../../telegram/iActions";
import {openAiProvider} from "../../provider/openAiProvider";


const generateImageResponse = async (prompt: string, actions: Actions, provider: ReturnType<typeof openAiProvider>) => {
  const typer = setInterval(actions.setUploading, 100);
  let answer = await provider.image(prompt);
  clearInterval(typer);
  if (answer === undefined) {
    return;
  }
  actions.sendImage(answer);
};

export {generateImageResponse};