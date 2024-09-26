import axios from "axios";
import {ResponseWorker} from "../iResponseWorker";
import {createContext} from "./context";
import {config} from "../../config";
import {Actions} from "../../telegram/iActions";


const openAiWorker = (): ResponseWorker => {
  const openaiApiKey = config.openaiApiKey;
  let context: Awaited<ReturnType<typeof createContext>>;
  try {
    context = createContext().loadFromFile("output.json");
  } catch (error) {
    throw new Error(`Ошибка при загрузке контекста: ${error.toString()}`);
  }
  const headers = {
    "Authorization": `Bearer ${openaiApiKey}`,
    "Content-Type": "application/json",
  };
  const max_tokens = 999;
  const model = "gpt-4o";

  let openAiContext = context;

  const prepareAiContext = (prompt: string, asService: boolean = false) => {
    return [
      {
        "role": "system",
        "content": "ВСЕ ПУНКТЫ ОБЯЗАТЕЛЬНЫ К ИСПОЛНЕНИЮ!\
1. Тебя зовут Геннадий, я буду отправлять тебе сообщения, а ты должен определить, я обращаюсь к тебе или нет. Если я обращаюсь к тебе ты должен ответить \
Если обращение направленно не к тебе то ты отвечаешь \"-пропуск-\"\
4. Ты в переписке, отвечай как отвечают в переписке. \
5. Соблюдай стиль общения который уже есть в диалоге. \
6. Отвечай не эмоционально. \
7. Отвечай как другу. \
8. Никаких быдло слов типа 'братишка','ништяк', 'с кайфом' \
9. Не ставь в конце точки, начинай предложения с маленькой буквы. \
10. Не реагируй на оскорбления. \
11. Если какая то тема тебе не нравится то просто отправь в ответ 🤡"
      },
      ...openAiContext.get().slice(-60),
      {
        "role": asService ? "system" : "user",
        "content": prompt
      }
    ];
  };

  return Object.freeze({
    async generateResponse(prompt: string, actions: Actions, asService: boolean = false) {
      try {

        let request_to_image = false;
        let httpResponse = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model,
            messages: [{
              "role": "user",
              "content": "Это выглядит как запрос на рисование изображения? Ответь просто '-да-' если это так и '-нет-' если это не так, запрос - '" + prompt + "'"
            }],
            max_tokens,
          },
          {
            headers,
          }
        );
        let answer = httpResponse.data.choices[0].message.content.trim();
        if (answer == "-да-") {
          request_to_image = true;
        }


        actions.markRead();
        actions.setTyping();
        if (!request_to_image) {
          httpResponse = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
              model,
              messages: prepareAiContext(prompt, asService),
              max_tokens,
            },
            {
              headers,
            }
          );
          answer = httpResponse.data.choices[0].message.content.trim();
          openAiContext
            .add([{role: asService ? "system" : "user", content: prompt}])
            .add([{role: "assistant", content: answer}]);
          const codePoint = answer.codePointAt(0);
          if (
            (codePoint >= 0x2600 && codePoint <= 0x26FF) ||   // Символы разное
            (codePoint >= 0x2700 && codePoint <= 0x27BF) ||   // Символы разное (продолжение)
            (codePoint >= 0x1F600 && codePoint <= 0x1F64F) || // Эмоджи лиц
            (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) || // Символы и пиктограммы
            (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) || // Транспорт и карты
            (codePoint >= 0x1F700 && codePoint <= 0x1F77F) ||   // Астрологические символы
            (codePoint >= 0x1F780 && codePoint <= 0x1F7FF) ||   // Геометрические символы
            (codePoint >= 0x1F800 && codePoint <= 0x1F8FF) ||   // Дополнительные символы
            (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) ||   // Дополнительные символы и модификаторы
            (codePoint >= 0x1FA00 && codePoint <= 0x1FA6F) ||   // Разные символы и знаки
            (codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF)    // Флаги-
          ) {
            actions.sendEmoji(answer);
          } else {
            actions.sendMessage(answer);
          }
        } else {
          let httpResponse = await axios.post(
            "https://api.openai.com/v1/images/generations",
            {
              "model": "dall-e-3",
              "prompt": prompt,
              "n": 1,
              "size": "1024x1024"
            },
            {
              headers,
            }
          );
          console.log(httpResponse)
          let answer = httpResponse.data.data[0].url;
          actions.sendImage(answer);
        }


        if (Math.random() < 0.15) {
          this.generateResponse("Учтя свой предыдущий ответ, продолжи развивать тему дальше, расшевели диалог", actions, true);
        }
      } catch (error) {
        console.error("Ошибка при запросе к OpenAI API:", error);
        return;
      }
    }
  });
};

export {openAiWorker};
