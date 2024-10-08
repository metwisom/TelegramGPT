import fs from "node:fs";
import {Message} from "./iMessage";


const createContext = () => {
  const messageHistory: Message[] = [];
  return Object.freeze({
    loadFromFile(fileName: string) {
      const data = JSON.parse(fs.readFileSync(fileName).toString());
      this.add(data);
      return this;
    },
    add(message_history: Message[]) {
      messageHistory.push(...message_history);
      return this;
    },
    get() {
      return messageHistory;
    }
  });
};

export {createContext};