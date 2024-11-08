import {TelegramByUser} from "./telegram/telegramByUser";
import {openAiWorker} from "./worker/openAI/openAiWorker";
import {config} from "./config";

(() => {
  const worker = openAiWorker(config.openaiAiKey);

  TelegramByUser()
    .setWorker(worker)
    .start()
})()


