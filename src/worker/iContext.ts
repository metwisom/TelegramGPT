import {Message} from "./iMessage";


type Context = {
  loadFromFile(fileName: string): Context
  add(message_history: Message[]): Context
  get(): Message[]
}

export {Context};