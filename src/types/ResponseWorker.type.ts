import {Actions} from "./Actions.type";


type ResponseWorker = {
  generateResponse(prompt: string, action: Actions): Promise<void>;
}

export {ResponseWorker};