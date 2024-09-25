import {Api, TelegramClient} from "telegram";
import {StringSession} from "telegram/sessions";
import {NewMessage} from "telegram/events";
import promptSync from "prompt-sync";
import {ResponseWorker} from "../worker/iResponseWorker";
import {config} from "../config";


const prompt = promptSync();

const TelegramByUser = function () {
  const apiId = config.apiId;
  let target = config.target;
  const apiHash = config.apiHash;
  const tgToken = config.tgToken;
  const session = new StringSession(tgToken);
  let client: TelegramClient;
  let worker: ResponseWorker;

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

  const sendAnswer = async (message: Api.Message, prompt: string) => {
    if (target !== message.senderId.valueOf()) {
      return;
    }

    const sendMessage = (generatedMessage: string) => {
      setTyping(message);
      markRead(message);
      setTimeout(() => {
        client.sendMessage(message.peerId, {
          message: generatedMessage
        });
      }, generatedMessage.length * 100 + prompt.length * 40);
    };


    await worker.generateResponse(prompt, sendMessage);


  };
  return Object.freeze({
    setWorker(newWorker: ResponseWorker) {
      worker = newWorker;
      return this;
    },
    async start() {
      client = new TelegramClient(session, apiId, apiHash, {connectionRetries: 5});
      await client.start({
        phoneNumber: async () => prompt("Введите ваш номер телефона: "),
        password: async () => prompt("Введите ваш пароль (если требуется): "),
        phoneCode: async () => prompt("Введите код из TelegramByUser: "),
        onError: (err) => console.log(err),
      });
      client.session.save();
      client.addEventHandler((event) => {
        sendAnswer(event.message, event.message.text).then();
      }, new NewMessage({}));
    },
  });
};

export {TelegramByUser};
