import { Message } from '../../types/Message.type';
import { pgProvider } from '../../provider/pgProvider';
import { MoodManager } from './moodManager';

const moodManager = new MoodManager();

const createContext = () => {
  return Object.freeze({
    async prepare(
      history: Message[],
      prompt: string,
      chatId: number,
      asService: boolean = false
    ): Promise<Message[]> {
      const systemContent = await pgProvider.getSystemPrompt();
      const mood = await moodManager.get(chatId);

      const moodDescription = Object.entries(mood)
        .map(([key, value]) => `${key}: ${value}/10`)
        .join(', ');

      const fullSystemContent = `${systemContent}\n\nТвоё текущее настроение от общения с этим собеседником (учитывай его при формировании ответа, оно отражает твоё эмоциональное состояние): ${moodDescription}.`;

      return [
        { role: 'system', content: fullSystemContent },
        ...history,
        {
          role: asService ? ('system' as const) : ('user' as const),
          content: prompt,
        },
      ];
    },
  });
};

export { createContext };
