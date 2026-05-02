import { Message } from '../../types/Message.type';
import { pgProvider } from '../../provider/pgProvider';
import { MoodManager } from './moodManager';

const moodManager = new MoodManager();

const fix = (history: Message[]): Message[] => {
  const result: Message[] = [];
  for (const message of history) {
    const previous = result[result.length - 1];
    if (
      previous &&
      previous.role === message.role &&
      (message.role === 'user' || message.role === 'assistant')
    ) {
      const oppositeRole: 'user' | 'assistant' =
        message.role === 'user' ? 'assistant' : 'user';
      result.push({ role: oppositeRole, content: '' });
    }
    result.push(message);
  }

  if (result.length === 0) {
    result.push({ role: 'assistant', content: '' });
  }

  if (result[0].role !== 'assistant') {
    result.unshift({ role: 'assistant', content: '' });
  }

  if (result[result.length - 1].role !== 'assistant') {
    result.push({ role: 'assistant', content: '' });
  }

  return result;
};

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

      const messages: Message[] = [
        { role: 'user', content: fullSystemContent },
        ...fix(history),
        {
          role: asService ? ('system' as const) : ('user' as const),
          content: prompt,
        },
      ];

      if (messages[messages.length - 1].role !== 'user') {
        messages.push({ role: 'user', content: '' });
      }

      return messages;
    },
  });
};

export { createContext };
