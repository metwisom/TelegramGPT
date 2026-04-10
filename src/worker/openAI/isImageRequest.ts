import { openAiProvider } from '../../provider/openAiProvider';
import { Message } from '../../types/Message.type';

const isImageRequest = async (prompt: string, provider: ReturnType<typeof openAiProvider>) => {
  const messages: Message[] = [
    {
      role: 'user',
      content:
        "Это выглядит как запрос на рисование изображения? Ответь просто '-да-' если это так и '-нет-' если это не так, запрос - '" +
        prompt +
        "'",
    },
  ];
  let answer = await provider.chat(messages);
  return answer === '-да-';
};

export { isImageRequest };
