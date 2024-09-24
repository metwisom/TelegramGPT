import {MessageGPT} from "./iMessage";
import fs from "fs";

export type Context = {
    target: number
    loadFromFile(fileName: string): Context
    add(message_history: MessageGPT[]): Context
    get(): MessageGPT[]
}

const createContext = (targetId: number): Readonly<Context> => {
    const messageHistory: MessageGPT[] = []
    return Object.freeze({
        target: parseInt(targetId.toString()),
        loadFromFile(fileName: string) {
            const data = JSON.parse(fs.readFileSync(fileName).toString())
            this.add(data)
            return this;
        },
        add(message_history: MessageGPT[]) {
            messageHistory.push(...message_history)
            return this;
        },
        get() {
            return messageHistory;
        }
    })
}

export {createContext}