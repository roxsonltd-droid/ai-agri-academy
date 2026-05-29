# AI Design — преглед на сайта и шрифтовете

Последна проверка по [AI_DESIGN.md](./AI_DESIGN.md).

## Статус (изпълнени препоръки)

1. **Светът app shell** — добавени са токени `--color-app-*` в `src/app/globals.css` (`@theme`). Страниците **курс**, **login/register**, **Clerk sign-in/up** и **labs** (състояния success/default) ползват `bg-app-surface`, `text-app-ink`, `border-app-border`, `text-app-primary` и т.н. — **без `#hex` в JSX**.
2. **`Input` / `Label`** — подравнени с **тъмната** семантика (`border-input`, `bg-background`, `text-foreground`, `ring-ring/40`). Светлите auth форми ползват **`src/lib/app-shell-classes.ts`** (`appInputClassName`, `appFieldLabelClassName`).
3. **Споделени класове** — `app-shell-classes.ts` за повторяеми полета на auth.

## Шрифтове

- **Inter** + `font-sans` на `body`; светлите страници наследяват същия стек.

## Как да обновиш този файл

След големи UI промени: `rg "#[0-9A-Fa-f]{6}" src` — не трябва да има съвпадения извън `globals.css` (`@theme` и utility дефиниции).
