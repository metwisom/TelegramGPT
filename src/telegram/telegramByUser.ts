import {Api, TelegramClient} from "telegram";
import {StringSession} from "telegram/sessions";
import {NewMessage} from "telegram/events";
import promptSync from "prompt-sync";
import {ResponseWorker} from "../worker/iResponseWorker";
import {config} from "../config";
import fs from "node:fs";
import {CustomFile} from "telegram/client/uploads";
import * as https from "node:https";


const prompt = promptSync();


const TelegramByUser = function () {
  const apiId = config.apiId;
  let target = config.target;
  const apiHash = config.apiHash;
  const tgToken = config.tgToken;
  const session = new StringSession(tgToken);
  let client: TelegramClient;
  let worker: ResponseWorker;


  const sendAnswer = async (message: Api.Message, prompt: string) => {
    if (!message.isPrivate) {
      return;
    }

    const actions = {
      sendImage: async (path: string) => {

        const savePath = ''+ Math.random() + '.png'
        https.get(path,  (response) => {
          if (response.statusCode === 200) {
            const fileStream = fs.createWriteStream(savePath);
            response.pipe(fileStream);

            fileStream.on('finish', async() => {
              fileStream.close();
              client.invoke(
                new Api.messages.SendMedia({
                  peer: Number(message.chatId),
                  media: new Api.InputMediaUploadedPhoto({
                    file: await client.uploadFile({
                      file: new CustomFile(
                        savePath,
                        fs.statSync(savePath).size,
                        savePath
                      ),
                      workers: 1,
                    }),
                    ttlSeconds: 43,
                  }),
                  message: "",
                })
              );
              console.log('File downloaded and saved to', savePath);
            });
          } else {
            console.error('Failed to download file. Status code:', response.statusCode);
          }
        }).on('error', (err) => {
          console.error('Error downloading file:', err.message);
        });


      },
      sendEmoji: (emoji: string) => {
        client.invoke(
          new Api.messages.SendReaction({
            peer: Number(message.chatId),
            msgId: Number(message.id),
            reaction: [new Api.ReactionEmoji({emoticon: emoji})],
          })
        );
      },
      sendMessage: (generatedMessage: string) => {
        client.sendMessage(message.peerId, {
          message: generatedMessage
        });
      },
      setTyping: () => {
        client.invoke(
          new Api.messages.SetTyping({
            peer: message.chatId.valueOf(),
            action: new Api.SendMessageTypingAction(),
            topMsgId: 43,
          })
        ).then();
      },
      markRead: () => {
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
      }
    };


    await worker.generateResponse(prompt, actions);


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
      console.log(client.session.save());
      client.addEventHandler((event) => {
        sendAnswer(event.message, event.message.text).then();
      }, new NewMessage({}));
    },
  });
};

export {TelegramByUser};
