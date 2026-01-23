import * as process from 'node:process';

type Config = {
  openaiAiKey: string | undefined;
  openAiHost: string | undefined;
  apiId: number;
  apiHash: string | undefined;
  target: number;
  tgToken: string | undefined;
  memderHost?: string | undefined;
  memderUploadPath?: string | undefined;
  temperature?: number;
};

const config: Config = {
  openaiAiKey: process.env.OPEN_AI_TOKEN,
  openAiHost: process.env.OPEN_AI_HOST,
  apiId: Number(process.env.APP_ID ?? NaN),
  apiHash: process.env.API_HASH,
  target: Number(process.env.TARGET ?? NaN),
  tgToken: process.env.TG_TOKEN,
  memderHost: process.env.MEMDER_HOST,
  memderUploadPath: process.env.MEMDER_UPLOAD_PATH ?? '/api/upload',
  temperature: process.env.TEMPERATURE ? Number(process.env.TEMPERATURE) : 0.7,
};
if (process.env.NODE_ENV !== 'test') {
  if (!config.openaiAiKey) {
    throw new Error('Environment variable OPEN_AI_TOKEN is required');
  }
  if (!config.openAiHost) {
    throw new Error('Environment variable OPEN_AI_HOST is required');
  }
  if (Number.isNaN(config.apiId)) {
    throw new Error('Environment variable APP_ID must be a number');
  }
  if (!config.apiHash) {
    throw new Error('Environment variable API_HASH is required');
  }
  if (Number.isNaN(config.target)) {
    throw new Error('Environment variable TARGET must be a number');
  }
}

export {config, type Config};