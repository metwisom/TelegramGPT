import {TelegramGPT} from "./telegramGPT";
import {createContext} from "./context";
import * as process from "node:process";

const apiId = parseInt(process.env.APP_ID.toString());
const apiHash = process.env.API_HASH;
const target = parseInt(process.env.TARGET.toString());

const tgToken = process.env.TG_TOKEN;

const context = createContext(target);
context.loadFromFile('output.json')

TelegramGPT(apiId, apiHash)
    .connect(tgToken).then(tg => {
    tg.addContext(context).start()
})
