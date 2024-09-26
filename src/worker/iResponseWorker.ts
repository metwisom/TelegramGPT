import {Actions} from "../telegram/iActions";


type ResponseWorker = {
  generateResponse(prompt: string, action: Actions): Promise<void>;
}

export {ResponseWorker};