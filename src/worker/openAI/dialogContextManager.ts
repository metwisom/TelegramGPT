import { Message } from '../../types/Message.type';
import { pgProvider } from '../../provider/pgProvider';

const MAX_HISTORY_PER_USER = 10;

class DialogContextManager {
  private initialized = false;

  async init(): Promise<void> {
    if (!this.initialized) {
      await pgProvider.ensureTable();
      this.initialized = true;
    }
  }

  async load(chatId: number): Promise<Message[]> {
    await this.init();
    const result = await pgProvider
      .getPool()
      .query(
        'SELECT role, content FROM messages WHERE chat_id = $1 ORDER BY created_at ASC LIMIT $2',
        [chatId, MAX_HISTORY_PER_USER]
      );
    return result.rows.map((row: { role: string; content: string }) => ({
      role: row.role as Message['role'],
      content: row.content,
    }));
  }

  async add(chatId: number, messages: Message[]): Promise<void> {
    await this.init();
    const pool = pgProvider.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const msg of messages) {
        await client.query('INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)', [
          chatId,
          msg.role,
          msg.content,
        ]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    await this.trimHistory(chatId);
  }

  async get(chatId: number): Promise<Message[]> {
    return this.load(chatId);
  }

  private async trimHistory(chatId: number): Promise<void> {
    await pgProvider.getPool().query(
      `DELETE FROM messages WHERE chat_id = $1 AND id NOT IN (
        SELECT id FROM messages WHERE chat_id = $1 ORDER BY created_at DESC LIMIT $2
      )`,
      [chatId, MAX_HISTORY_PER_USER]
    );
  }
}

export { DialogContextManager };
