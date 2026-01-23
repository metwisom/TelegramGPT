import {Actions} from "./Actions.type";


type ResponseWorker = {
  generateResponse(prompt: string, action: Actions, forceRespond?: boolean): Promise<void>;
}

export {ResponseWorker};