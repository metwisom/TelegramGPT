import {Api, TelegramClient, utils} from "telegram";
import {StringSession} from "telegram/sessions";
import {NewMessage, NewMessageEvent} from "telegram/events";
import promptSync from "prompt-sync";
import {ResponseWorker} from "../types/ResponseWorker.type";
import {config} from "../config";
import fs from "node:fs";
import {CustomFile} from "telegram/client/uploads";
import {fileProvider} from "../provider/fileProvider";
import {uploadFile} from "../uploadMemder";


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

    // Check if bot should force respond
    let forceRespond = false;
    
    // Check if message contains @genadebich ping
    if (prompt && prompt.includes('@genadebich')) {
      forceRespond = true;
      console.log('Message contains @genadebich, forcing response');
    }
    
    // Check if message is a reply to bot's message
    if (message.replyTo && !forceRespond) {
      try {
        const repliedMessage = await message.getReplyMessage();
        if (repliedMessage && repliedMessage.out === true) {
          forceRespond = true;
          console.log('Message is a reply to bot, forcing response');
        }
      } catch (err) {
        console.error('Error checking reply message:', err);
      }
    }

    if (message.isChannel) {
      const chat = await client.getEntity(event.chatId || event.message.peerId) as Api.Channel;
      const username = chat.username;
      console.log(username);
      if (message.media && utils.isImage(message.media)) {
        const fileName = "test" + Math.random() + ".jpg";
        await client.downloadMedia(message.media, {
          outputFile: fileName,
        });
        await uploadFile(username, message.id, Number(chat.id), fileName);
        fs.unlinkSync(fileName);
      }
      if (username != null) {
        return;
      }
    }


    console.log(message.text);
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
            peer: message.peerId,
            msgId: message.id,
            reaction: [new Api.ReactionEmoji({emoticon: emoji})],
          })
        ).catch(err => {
          console.error('Error sending emoji:', err);
        });
      },
      sendReactions: (emojis: string[]) => {
        if (emojis.length === 0) return;
        try {
          const reactions = emojis.map(emoji => new Api.ReactionEmoji({emoticon: emoji}));
          console.log('Sending reactions:', JSON.stringify(reactions), 'to peer:', message.peerId, 'msgId:', message.id);
          client.invoke(
            new Api.messages.SendReaction({
              peer: message.peerId,
              msgId: message.id,
              reaction: reactions,
            })
          ).catch(err => {
            console.error('Error sending reactions:', err);
          });
        } catch (err) {
          console.error('Error preparing reactions:', err);
        }
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


    await worker.generateResponse(prompt, actions, forceRespond);


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
