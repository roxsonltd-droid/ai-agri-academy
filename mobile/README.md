# AI Agro Academy — Expo (React Native)

Стартиране (след `npm install` в тази папка):

```bash
npx expo start
```

## Конфигурация

Задайте URL на FastAPI в `app.config.ts` (`extra.apiUrl`) или чрез `.env` с `EXPO_PUBLIC_API_URL`.

Мобилното приложение споделя същите REST endpoints като Next.js уеб клиента (`/api/v1/...`).

## Препоръка

За чист инстал може и: `npx create-expo-app@latest . --template blank-typescript` в подпапка и да копирате `app.config.ts` оттук.
