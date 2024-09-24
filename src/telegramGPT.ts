import {TelegramClient, Api} from 'telegram';
import {StringSession} from 'telegram/sessions';
import {NewMessage} from 'telegram/events';
import {generateResponse} from "./openAi";
import {Context} from "./context";

const prompt = require('prompt-sync')();

const TelegramGPT = function (apiId: number, apiHash: string) {
    let session = new StringSession('')
    let client: TelegramClient;
    let context: Context;
    const setTyping = (message: Api.Message) => {
        client.invoke(
            new Api.messages.SetTyping({
                peer: message.chatId.valueOf(),
                action: new Api.SendMessageTypingAction(),
                topMsgId: 43,
            })
        ).then();
    }
    const markRead = (message: Api.Message) => {
        let chatId: number = 0;
        if (message.isGroup) {
            chatId = message.chatId.valueOf()
        }
        if (message.isChannel) {
            return
        }
        if (message.isPrivate) {
            chatId = (message.peerId as Api.PeerUser).userId.valueOf()
        }
        client.invoke(
            new Api.messages.ReadHistory({
                peer: chatId,
                maxId: message.id.valueOf(),
            })
        ).then();
    }
    const sendAnswer = async (message: Api.Message, prompt: string, isAddon: boolean = false) => {
        if (context.target !== message.senderId.valueOf()) {
            return;
        }

        let finalPrompt = prompt
        if (isAddon) {
            finalPrompt = "Учтя свой предыдущий ответ, продолжи развивать тему дальше, расшевели диалог"
        }

        setTyping(message)
        markRead(message)

        const generatedResponse = await generateResponse(finalPrompt, context, isAddon);

        setTimeout(() => {
            client.sendMessage(message.peerId, {
                message: generatedResponse
            });

            if (Math.random() < 0.15) {
                sendAnswer(message, prompt, true)
            }

        }, generatedResponse.length * 100 + prompt.length * 40)


    }
    return Object.freeze({
        async start(sessionKey: string = '') {
            session = new StringSession(sessionKey)
            client = new TelegramClient(session, apiId, apiHash, {connectionRetries: 5});
            await client.start({
                phoneNumber: async () => await prompt('Введите ваш номер телефона: '),
                password: async () => await prompt('Введите ваш пароль (если требуется): '),
                phoneCode: async () => await prompt('Введите код из Telegram: '),
                onError: (err) => console.log(err),
            });
            client.session.save();
            client.addEventHandler((event) => {
                sendAnswer(event.message, event.message.text).then()
            }, new NewMessage({}));
        },
        addContext(newContext: Context) {
            context = newContext
            return this
        },
    })
}

export {TelegramGPT};
