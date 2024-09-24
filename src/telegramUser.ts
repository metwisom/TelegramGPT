import {Api, TelegramClient} from "telegram";
import {StringSession} from "telegram/sessions";
import {NewMessage} from "telegram/events";1
import promptSync from "prompt-sync";
import {ResponseWorker} from "./iResponseWorker";


const prompt = promptSync();

const TelegramUser = function (apiId: number, apiHash: string, sessionKey: string = "") {
  let session = new StringSession(sessionKey);
  let client: TelegramClient;
  let worker: ResponseWorker;
  let target = 0;
  const setTyping = (message: Api.Message) => {
    client.invoke(
      new Api.messages.SetTyping({
        peer: message.chatId.valueOf(),
        action: new Api.SendMessageTypingAction(),
        topMsgId: 43,
      })
    ).then();
  };
  const markRead = (message: Api.Message) => {
    let chatId: number = 0;
    if (message.isGroup) {
      chatId = message.chatId.valueOf();
    }
    if (message.isChannel) {
      return;
    }
    if (message.isPrivate) {
      chatId = (message.peerId as Api.PeerUser).userId.valueOf();
    }
    client.invoke(
      new Api.messages.ReadHistory({
        peer: chatId,
        maxId: message.id.valueOf(),
      })
    ).then();
  };
  const sendAnswer = async (message: Api.Message, prompt: string, isAddon: boolean = false) => {
    if (target !== message.senderId.valueOf()) {
      return;
    }

    let finalPrompt = prompt;
    if (isAddon) {
      finalPrompt = "Учтя свой предыдущий ответ, продолжи развивать тему дальше, расшевели диалог";
    }

    setTyping(message);
    markRead(message);

    const generatedResponse = await worker.getResponse(finalPrompt, isAddon);

    setTimeout(() => {
      client.sendMessage(message.peerId, {
        message: generatedResponse
      });
      if (Math.random() < 0.15) {
        sendAnswer(message, prompt, true);
      }
    }, generatedResponse.length * 100 + prompt.length * 40);
  };
  return Object.freeze({
    setTarget(newTarget: number) {
      target = newTarget;
      return this;
    },
    async start() {
      client = new TelegramClient(session, apiId, apiHash, {connectionRetries: 5});
      await client.start({
        phoneNumber: async () => prompt("Введите ваш номер телефона: "),
        password: async () => prompt("Введите ваш пароль (если требуется): "),
        phoneCode: async () => prompt("Введите код из TelegramUser: "),
        onError: (err) => console.log(err),
      });
      client.session.save();
      client.addEventHandler((event) => {
        sendAnswer(event.message, event.message.text).then();
      }, new NewMessage({}));
    },
    setWorker(newWorker: ResponseWorker) {
      worker = newWorker;
      return this;
    },
  });
};

export {TelegramUser};
