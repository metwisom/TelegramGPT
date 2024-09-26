const config = {
  openaiApiKey: process.env.OPEN_API_TOKEN,
  apiId: Number(process.env.APP_ID),
  apiHash: process.env.API_HASH,
  target: Number(process.env.TARGET),
  tgToken: process.env.TG_TOKEN
};

export {config};

if (!config.openaiApiKey) {
  throw new Error("OPEN_API_TOKEN не задан");
}
if (Number.isNaN(config.apiId)) {
  throw new Error("APP_ID должен быть числом");
}
if (!config.apiHash) {
  throw new Error("API_HASH не задан");
}
if (Number.isNaN(config.target)) {
  throw new Error("TARGET должен быть числом");
}