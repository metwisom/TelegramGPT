import {httpProvider} from "./httpProvider";
import {createContext} from "../worker/openAI/context";
import {config} from "../config";


const openAiProvider = (openaiAiKey: string) => {
  const provider = httpProvider(
    config.openAiHost, {
      "Authorization": `Bearer ${openaiAiKey}`,
      "Content-Type": "application/json",
    });
  const max_tokens = 999;
  const model = "gpt-4o";

  return Object.freeze({
    chat: async (prompt: string, openAiContext: ReturnType<typeof createContext> = undefined, asService: boolean = false): Promise<string> => {
      const httpResponse = await provider.post("/chat/completions",
        {
          model,
          messages: openAiContext === undefined ? [{
            "role": "user",
            "content": prompt
          }] : openAiContext.prepare(prompt, asService),
          max_tokens,
        }
      );
      return httpResponse.choices[0].message.content.trim();
    },
    image: async (prompt: string): Promise<string> => {
      const httpResponse = await provider.post("/images/generations",
        {
          "model": "gpt-image-1",
          "prompt": prompt + "",
          "n": 1,
          "size": "1024x1024"
        }
      );
      if (httpResponse.error !== undefined) {
        console.log(httpResponse.error);
        return undefined;
      }
      return httpResponse.data[0].url;
    }
  });
};

export {openAiProvider};