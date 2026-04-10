import { pgProvider } from '../../provider/pgProvider';
import { openAiProvider } from '../../provider/openAiProvider';
import { config } from '../../config';
import { Message } from '../../types/Message.type';

type MoodCharacteristics = Record<string, number>;

const DEFAULT_CHARACTERISTICS: MoodCharacteristics = {
  Доброжелательность: 5,
  Формальность: 5,
  Агрессивность: 2,
  Интерес: 5,
  Серьёзность: 5,
  Уважение: 7,
  Доминантность: 5,
  Открытость: 5,
};

class MoodManager {
  private aiProvider = openAiProvider(config.openAiHost ?? '', config.openaiAiKey ?? '');
  private initialized = false;

  private async init(): Promise<void> {
    if (!this.initialized) {
      await pgProvider.ensureTable();
      this.initialized = true;
    }
  }

  async get(chatId: number): Promise<MoodCharacteristics> {
    await this.init();
    const result = await pgProvider
      .getPool()
      .query('SELECT characteristics FROM mood WHERE chat_id = $1', [chatId]);
    if (result.rows.length === 0) return { ...DEFAULT_CHARACTERISTICS };
    return result.rows[0].characteristics as MoodCharacteristics;
  }

  async update(chatId: number, incomingMessage: string): Promise<MoodCharacteristics> {
    await this.init();
    const current = await this.get(chatId);

    const characteristicsList = Object.entries(current)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const moodPrompt: Message[] = [
      {
        role: 'system',
        content:
          'Твоя задача оценить и внести изменения в характеристики настроения. Ты получишь сообщение, в ответ на которое должен дать новый JSON со значениями, где ключ — это название характеристики, а значение — это новое значение по твоей оценке. Шкала от 0 до 10. ВАЖНО: шаг изменения каждой характеристики может быть от +3 до -3 относительно текущего значения. Резкие скачки запрещены. В ответе верни ТОЛЬКО JSON, без обёрток в markdown и без лишнего текста.',
      },
      {
        role: 'user',
        content: `Сообщение собеседника: "${incomingMessage}"\nТекущие характеристики: ${characteristicsList}`,
      },
    ];

    console.log('[MOOD] Отправлено на оценку настроения:', JSON.stringify(moodPrompt));

    const rawResponse = await this.aiProvider.chat(moodPrompt);

    console.log('[MOOD] Получен ответ от нейросети:', rawResponse);

    let parsed: MoodCharacteristics;
    try {
      const jsonStr = rawResponse.replace(/```json\s*|```/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('[MOOD] Не удалось распарсить ответ, сохраняем текущие значения');
      return current;
    }

    const updated: MoodCharacteristics = { ...current };
    for (const [key, value] of Object.entries(parsed)) {
      const clamped = Math.max(0, Math.min(10, Number(value)));
      if (!isNaN(clamped)) {
        updated[key] = clamped;
      }
    }

    await pgProvider.getPool().query(
      `INSERT INTO mood (chat_id, characteristics, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (chat_id) DO UPDATE SET characteristics = $2, updated_at = NOW()`,
      [chatId, JSON.stringify(updated)]
    );

    console.log('[MOOD] Обновлённые характеристики:', JSON.stringify(updated));
    return updated;
  }
}

export { MoodManager, type MoodCharacteristics };
