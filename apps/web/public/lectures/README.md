# Лекции (Markdown)

## Канонично съдържание

Източникът на истина е **`content/academy/courses/`** в монорепото (всеки курс: `course.json` + `.md` файлове).

Синхронизация към Next и мобилното приложение:

```bash
# от корена на agrinexus-final
npm run sync:academy
```

Това копира лекциите тук под **`public/lectures/courses/<slug>/...`** и обновява **`src/content/academy.catalog.json`**.

### Нова лекция

1. Добавете `.md` в съответната папка на курса в `content/academy/...`.
2. Добавете запис в `lectures` вътре в `course.json` за този курс.
3. Пуснете `npm run sync:academy`.
4. При нужда от финален тест: `src/content/final-course-tests/<slug>.ts` (25 въпроса) и регистрация в `final-course-tests/index.ts`.

Страницата **„Лектор“** (`/academy/lecturer`) зарежда текста от `/lectures/<file>`.
