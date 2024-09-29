import {TelegramByUser} from "./telegram/telegramByUser";
import {openAi} from "./worker/openAI/openAi";


const worker = openAi();

TelegramByUser()
  .setWorker(worker)
  .start()
  .then();
