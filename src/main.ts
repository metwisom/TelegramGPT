import {TelegramByUser} from "./telegram/telegramByUser";
import {openAiWorker} from "./worker/openAI/openAiWorker";


const worker = openAiWorker();

TelegramByUser()
  .setWorker(worker)
  .start()
  .then();
