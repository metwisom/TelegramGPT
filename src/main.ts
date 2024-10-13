import {TelegramByUser} from "./telegram/telegramByUser";
import {openAiWorker} from "./worker/openAI/openAiWorker";
import {config} from "./config";


const worker = openAiWorker(config.openaiApiKey);

TelegramByUser()
  .setWorker(worker)
  .start()
  .then();
