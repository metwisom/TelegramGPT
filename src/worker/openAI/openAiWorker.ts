import { ResponseWorker } from '../../types/ResponseWorker.type';
import { createContext } from './context';
import { Actions } from '../../types/Actions.type';
import { isEmoji } from '../../utils/isEmoji';
import { DialogContextManager } from './dialogContextManager';
import { openAiProvider } from '../../provider/openAiProvider';
import { config } from '../../config';

function openAiWorker(openaiAiKey: string): ResponseWorker {
  const contextHelper = createContext();
  const dialogManager = new DialogContextManager();
  const aiProvider = openAiProvider(config.openAiHost ?? '', openaiAiKey);

  const generateChatResponse = async (
    prompt: string,
    actions: Actions,
    chatId: number,
    asService: boolean = false
  ) => {
    const typer = setInterval(actions.setTyping, 100);
    const history = dialogManager.get(chatId);
    const messages = contextHelper.prepare(history, prompt, asService);
    let answer = await aiProvider.chat(messages);
    answer = answer.split('Не синхронизировано:')[1] ?? answer;

    clearInterval(typer);

    dialogManager.add(chatId, [
      { role: asService ? ('system' as const) : ('user' as const), content: prompt },
      { role: 'assistant' as const, content: answer },
    ]);

    const codePoint = answer.codePointAt(0);
    if (isEmoji(codePoint)) {
      actions.sendEmoji(answer);
    } else {
      if (answer != '-пропуск-') {
        actions.sendMessage(answer);
      }
    }
  };

  return Object.freeze({
    async generateResponse(prompt: string, actions: Actions, chatId: number) {
      console.log('Generating response for prompt:', prompt, 'chatId:', chatId);
      actions.markRead();
      await generateChatResponse(prompt, actions, chatId);
    },
  });
}

export { openAiWorker };
