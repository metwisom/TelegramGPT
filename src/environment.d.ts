// noinspection JSUnusedGlobalSymbols

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_ID: number;
      API_HASH: string;
      TARGET: number;
      OPEN_API_TOKEN: string;
      TG_TOKEN: string;
    }
  }
}

export {};