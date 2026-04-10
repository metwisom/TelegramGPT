import { Actions } from './Actions.type';

type ResponseWorker = {
  generateResponse(prompt: string, action: Actions, chatId: number): Promise<void>;
};

export { ResponseWorker };
