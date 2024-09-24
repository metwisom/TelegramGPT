import * as process from "node:process";
import {TelegramUser} from "./telegramUser";
import {createContext} from "./worker/context";
import {openAiWorker} from "./worker/openAiWorker";


const openaiApiKey = process.env.OPEN_API_TOKEN;
const context = createContext().loadFromFile("output.json");
const worker = openAiWorker(openaiApiKey, context);

const apiId = parseInt(process.env.APP_ID.toString());
const apiHash = process.env.API_HASH;
const target = parseInt(process.env.TARGET.toString());
const tgToken = process.env.TG_TOKEN;
TelegramUser(apiId, apiHash, tgToken)
  .setTarget(target)
  .setWorker(worker)
  .start();
