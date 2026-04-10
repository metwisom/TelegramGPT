import fs from 'node:fs';
import path from 'node:path';
import { Message } from '../../types/Message.type';

const MAX_HISTORY_PER_USER = 60;

class DialogContextManager {
  private contexts: Map<string, Message[]> = new Map();
  private dir: string;

  constructor(storageDir: string = 'contexts') {
    this.dir = storageDir;
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  private filePath(chatId: number): string {
    return path.join(this.dir, `${chatId}.json`);
  }

  load(chatId: number): Message[] {
    const key = String(chatId);
    if (this.contexts.has(key)) {
      return this.contexts.get(key)!;
    }
    const file = this.filePath(chatId);
    if (fs.existsSync(file)) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        this.contexts.set(key, Array.isArray(data) ? data : []);
      } catch {
        this.contexts.set(key, []);
      }
    } else {
      this.contexts.set(key, []);
    }
    return this.contexts.get(key)!;
  }

  add(chatId: number, messages: Message[]): void {
    const history = this.load(chatId);
    history.push(...messages);
    if (history.length > MAX_HISTORY_PER_USER) {
      this.contexts.set(String(chatId), history.slice(-MAX_HISTORY_PER_USER));
    }
    this.save(chatId);
  }

  get(chatId: number): Message[] {
    return this.load(chatId);
  }

  private save(chatId: number): void {
    const file = this.filePath(chatId);
    const history = this.contexts.get(String(chatId)) ?? [];
    fs.writeFileSync(file, JSON.stringify(history, null, 2), 'utf-8');
  }
}

export { DialogContextManager };
