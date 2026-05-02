import { ResponseWorker } from '../../types/ResponseWorker.type';
import { createContext } from './context';
import { Actions } from '../../types/Actions.type';
import { isEmoji } from '../../utils/isEmoji';
import { DialogContextManager } from './dialogContextManager';
import { MoodManager } from './moodManager';
import { openAiProvider } from '../../provider/openAiProvider';
import { config } from '../../config';

function openAiWorker(openaiAiKey: string): ResponseWorker {
  const contextHelper = createContext();
  const dialogManager = new DialogContextManager();
  const moodManager = new MoodManager();
  const aiProvider = openAiProvider(config.openAiHost ?? '', openaiAiKey);

  const generateChatResponse = async (
    prompt: string,
    actions: Actions,
    chatId: number,
    asService: boolean = false
  ) => {
    const typer = setInterval(actions.setTyping, 100);

    await moodManager.update(chatId, prompt);

    const history = await dialogManager.get(chatId);
    const messages = await contextHelper.prepare(history, prompt, chatId, asService);
    let answer = await aiProvider.chat(messages);
    answer = answer.split(/Не синхронизированный:|Не синхронизировано:|Не синхронизированный ответ:/)[1] ?? answer;

    const corrected = answer//await aiProvider.chat([
    //   {
    //     role: 'user',
    //     content:
    //       'Ты редактор русскоязычных текстов. Проверь текст на адекватность сочетания слов, смысловые ошибки, ошибки в окончаниях, согласованиях и управлении. Игнорируй нецензурность и стилистику — твоя задача только исправить грамматические и смысловые ошибки. В ответ пришли только отредактированный текст, без пояснений и лишнего текста. Если ошибок нет — верни текст без изменений.',
    //   },
    //   { role: 'assistant', content: '' },
    //   { role: 'user', content: answer },
    // ]);

    clearInterval(typer);

    await dialogManager.add(chatId, [
      { role: asService ? ('system' as const) : ('user' as const), content: prompt },
      { role: 'assistant' as const, content: corrected },
    ]);

    const codePoint = corrected.codePointAt(0);
    if (isEmoji(codePoint)) {
      actions.sendEmoji(corrected);
    } else {
      if (corrected != '-пропуск-') {
        actions.sendMessage(corrected);
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
