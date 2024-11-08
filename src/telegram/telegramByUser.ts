import {Api, TelegramClient,utils} from "telegram";
import {StringSession} from "telegram/sessions";
import {NewMessage, NewMessageEvent} from "telegram/events";
import promptSync from "prompt-sync";
import {ResponseWorker} from "../worker/iResponseWorker";
import {config} from "../config";
import fs from "node:fs";
import {CustomFile} from "telegram/client/uploads";
import {fileProvider} from "../provider/fileProvider";
import {uploadFile} from "../uploadMemder";
import path from "path";
import TypeChat = Api.TypeChat;


const prompt = promptSync();


const TelegramByUser = function () {
  const apiId = config.apiId;
  const apiHash = config.apiHash;
  const tgToken = config.tgToken;
  const session = new StringSession(tgToken);
  let client: TelegramClient;
  let worker: ResponseWorker;


  const sendAnswer = async (event: NewMessageEvent) => {
    const message = event.message;
    const prompt = event.message.text;

    if (message.isChannel) {
      const chat = await client.getEntity(event.chatId || event.message.peerId) as Api.Channel;
      const username = chat.username;
      console.log(username)
      if(utils.isImage(message.media)){
        const fileName = 'test' + Math.random() + '.jpg'
        await client.downloadMedia(message.media, {
          outputFile: fileName,
        })
        await uploadFile(username,message.id,fileName)
        fs.unlinkSync(fileName)
      }
      return;

    }


    console.log(message.text)
    if (message.isPrivate) {
      const sender = (await event.message.getSender()) as Api.User;
      let result = await client.invoke(
        new Api.contacts.AddContact({
          id: sender.username,
          firstName: sender.firstName ?? "",
          lastName: sender.lastName ?? "",
          phone: sender.phone ?? "",
          addPhonePrivacyException: false,
        })
      );
      // console.log(result);
    }

    const actions = {
      sendImage: async (url: string) => {
        fileProvider()
          .saveFile(url)
          .then(async path => {
            const result = client.invoke(
              new Api.messages.SendMedia({
                peer: Number(message.chatId),
                media: new Api.InputMediaUploadedPhoto({
                  file: await client.uploadFile({
                    file: new CustomFile(
                      path,
                      fs.statSync(path).size,
                      path
                    ),
                    workers: 1,
                  }),
                }),
                message: "",
              })
            );
            // console.log(result);
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
      setUploading: () => {
        const peer = message.chatId.valueOf();
        client.invoke(
          new Api.messages.SetTyping({
            peer,
            action: new Api.SendMessageUploadPhotoAction({progress: 1}),
            topMsgId: 43,
          })
        );
      },
      setTyping: () => {
        const peer = message.chatId.valueOf();
        client.invoke(
          new Api.messages.SetTyping({
            peer,
            action: new Api.SendMessageTypingAction(),
            topMsgId: 43,
          })
        );
      },
      markRead: () => {
        if (message.isChannel) {
          return;
        }
        const peer = message.chatId.valueOf();
        const maxId = message.id.valueOf();
        client.invoke(
          new Api.messages.ReadHistory({
            peer,
            maxId,
          })
        );

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
      client.addEventHandler(async (event) => {
        await sendAnswer(event);
      }, new NewMessage({}));
    },
  });
};

export {TelegramByUser};
