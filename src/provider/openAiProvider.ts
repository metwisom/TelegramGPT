import {httpProvider} from './httpProvider';
import {createContext} from '../worker/openAI/context';
import type {Message} from '../types/Message.type';

type OpenAIProvider = {
  chat: (prompt: string, openAiContext?: ReturnType<typeof createContext>, asService?: boolean) => Promise<string>;
  image: (prompt: string) => Promise<string | undefined>;
};

const openAiProvider = (host: string, openaiAiKey: string): OpenAIProvider => {
  const provider = httpProvider(host, {
    Authorization: `Bearer ${openaiAiKey}`,
    'Content-Type': 'application/json',
  });

  const max_tokens = 9999;

  const chat = async (prompt: string, openAiContext?: ReturnType<typeof createContext>, asService = false) => {
    const body: Record<string, any> = {
      messages: openAiContext === undefined ? [{role: 'user', content: prompt}] : openAiContext.prepare(prompt, asService),
      max_tokens,
    };
    const httpResponse = await provider.post('/chat/completions', body);
    if (!httpResponse || !httpResponse.choices) throw new Error('Invalid response from OpenAI chat endpoint');
    const content = httpResponse.choices[0]?.message?.content as string | undefined;
    return (content ?? '').trim();
  };

  const image = async (prompt: string) => {
    const httpResponse = await provider.post('/images/generations', {
      model: 'dall-e-3',
      prompt: `${prompt}`,
      n: 1,
      size: '1024x1024',
    });
    if (!httpResponse) return undefined;
    if (httpResponse.error) {
      console.error('OpenAI image error', httpResponse.error);
      return undefined;
    }
    return httpResponse.data?.[0]?.url;
  };

  return Object.freeze({chat, image});
};

export {openAiProvider};
