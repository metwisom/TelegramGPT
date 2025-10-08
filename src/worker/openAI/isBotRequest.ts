import {openAiProvider} from "../../provider/openAiProvider";


const isBotRequest = async (prompt: string, provider: ReturnType<typeof openAiProvider>) => {
  let answer = await provider.chat("Это выглядит как обращение к тому кого зовут Геннадий, Гена и проче формы имени? Ответь просто '-да-' если это так и '-нет-' если это не так, запрос - '" + prompt + "'");
	console.log(answer);
  return answer === "-да-";
};

export {isBotRequest};
