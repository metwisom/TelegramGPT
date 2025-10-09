# TelegramGPT

This repository is a Telegram bot that uses OpenAI for generating responses and images.

Developer quickstart

- Install dependencies: `npm install`
- Build TypeScript: `npm run build`
- Run in development (requires ts-node): `npm run dev`
- Run tests: `npx vitest run`
- Lint: `npx eslint src`

Environment

Copy `.env.example` to `.env` and fill in the required variables. The project expects:

- OPEN_AI_TOKEN - OpenAI API key
- OPEN_AI_HOST - OpenAI host URL
- APP_ID, API_HASH - Telegram API credentials
- TARGET, TG_TOKEN - target/chat and bot token

Notes

- TypeScript build works and a basic test suite is included.
- ESLint configuration was added; if you see errors when running eslint, ensure devDependencies are installed.
# telegramgpt

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run main.ts
```

This project was created using `bun init` in bun v1.1.29. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
