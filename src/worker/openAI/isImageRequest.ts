import {openAiProvider} from "../../provider/openAiProvider";


const isImageRequest = async (prompt: string, provider: ReturnType<typeof openAiProvider>) => {
  let answer = await provider.chat("Это выглядит как запрос на рисование изображения? Ответь просто '-да-' если это так и '-нет-' если это не так, запрос - '" + prompt + "'");
  return answer === "-да-";
};

export {isImageRequest};