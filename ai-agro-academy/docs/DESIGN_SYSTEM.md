# UI дизайн система — Tailwind CSS 4

**За AI агенти и автоматизации** (един ред резюме на договора): виж **[AI_DESIGN.md](./AI_DESIGN.md)** — шрифтове, цветове, компоненти и чеклист.

Стек: **Tailwind v4** (`@import "tailwindcss"`), токени в **`src/app/globals.css`** чрез директивата **`@theme`**, PostCSS с **`@tailwindcss/postcss`**.

## Принципи

1. **Семантични цветове** — предпочитай `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground` вместо произволни hex в JSX (постепенна миграция).
2. **Радиус** — `rounded-radius-lg`, `rounded-radius-xl`, `rounded-radius-full` за съгласувани закръгления.
3. **Сенки** — `shadow-elevated`, `shadow-hero` за карти и hero; класовете `stripe-shadow*` са алиас към същите токени.
4. **Движение** — за transition използвай `duration-normal`, `ease-spring` където има смисъл (`transition-[property] duration-normal ease-spring`).

## Токени → Tailwind utilities

| Токен (`@theme`) | Примери |
|------------------|---------|
| `--color-background` | `bg-background` |
| `--color-foreground` | `text-foreground` |
| `--color-primary` | `bg-primary`, `text-primary`, `border-primary` |
| `--color-primary-foreground` | `text-primary-foreground` (върху primary бутони) |
| `--color-muted` / `--color-muted-foreground` | `bg-muted`, `text-muted-foreground` |
| `--color-border` | `border-border` |
| `--color-card` | `bg-card`, `text-card-foreground` |
| `--color-accent` | `bg-accent`, `text-accent` |
| `--color-destructive` | `bg-destructive` |
| `--color-ring` | `ring-ring` (focus ring) |
| **`--color-app-*`** | **`bg-app-surface`**, **`text-app-ink`**, **`border-app-border`**, **`text-app-primary`**, … — светъл app shell (курс, auth); стойностите са дефинирани само в `@theme`. |
| `--radius-*` | `rounded-radius-sm` … `rounded-radius-full` |
| `--shadow-card`, `--shadow-elevated`, `--shadow-hero` | `shadow-card`, `shadow-elevated`, `shadow-hero` |

## ShadCN UI (New York)

Конфиг: **`components.json`** (`style: "new-york"`, `cssVariables: true`, Tailwind v4 без отделен `tailwind.config`).

### Компоненти в проекта (`src/components/ui/`)

| Файл | Описание |
|------|----------|
| `button.tsx` | `cva` + `@radix-ui/react-slot` — `asChild`, варианти: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, **`neon`** (accent) |
| `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` — токени `card` / `border` |
| `input.tsx` | Поле — **тъмна** семантика (`background` / `foreground` / `ring`); светъл auth ползва `src/lib/app-shell-classes.ts`. |
| `label.tsx` | Radix Label — `text-foreground`; за светъл shell ползвай `appFieldLabelClassName` от `app-shell-classes.ts`. |
| `badge.tsx` | Етикети / статуси |
| `separator.tsx` | Radix Separator |
| `skeleton.tsx` | Зареждащ placeholder |

### Добавяне на още от регистъра

От папка **`ai-agro-academy/`** (изисква интерактивен избор в терминала):

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add sheet
```

След генериране прегледайте diff: ShadCN понякога добавя `tailwind.config` — при нас темата е в **`globals.css`** (`@theme`); пренасочете класове към семантичните токени при нужда.

### Пример: бутон като линк (`asChild`)

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

<Button asChild variant="outline">
  <Link href="/courses">Курсове</Link>
</Button>
```

## Шрифт

**Inter** се зарежда в `src/app/layout.tsx` (`next/font/google`) и се задава като `--font-sans` на `<html>`; `font-sans` в Tailwind ползва този стек.

## Иконки

**Lucide** — единен набор иконки в бутони и навигация.

## Достъпност

- Контраст: основен текст `foreground` върху `background`; вторичен — `muted-foreground`.
- Фокус: `ring-2 ring-ring/40` (или компонентен focus от ShadCN) за видима фокусна рамка.

## Промяна на тема

Редактирай **`src/app/globals.css`** → блок **`@theme`**. По подразбиране темата е **тъмна футуристична** (slate фон, teal/violet акценти, AI градиенти върху `body`). Семантичните имена (`background`, `foreground`, `primary`, …) остават; променя се палитрата.

| Токен | Употреба |
|-------|----------|
| `--color-band` / `--color-band-foreground` | `bg-band`, `text-band-foreground` — тъмни ленти и chat bubble-и върху градиент. |

След промяна пусни `npm run build`, за да няма грешки от невалидни имена на токени.

## Glassmorphism и AI-повърхности (utility класове)

Дефинирани в **`globals.css`** (не са Tailwind `@apply` компоненти — ползват се като обикновени класове в `className`):

| Клас | Употреба |
|------|----------|
| `glass`, `glass-strong`, `glass-subtle`, `glass-dark` | Полупрозрачен фон + blur за карти, панели |
| **`glass-float`** | Плаваща „остров“ навигация (pill + сянка + лек teal glow) |
| `ai-panel` | Карта с „граница“ от градиент (псевдоелемент) — подходящо за dashboard mockup / ключови панели |
| `ai-mesh`, `ai-mesh-blob` | Фонови градиентни „облаци“ за hero или тъмни секции |
| `text-gradient-ai` | Градиентен акцент върху заглавие |
| `glow-primary`, `glow-accent` | Мека светлина около елемент (hover / hero) |
| `ai-pill` | Малък етикет в AI стил |
| `ai-bubble-assistant` | Балон за съобщение от асистент (чат UI) |
| `ai-shimmer-border` | Анимирана граница (опционално за highlight) |
| **`nav-link-futuristic`** | Навигационни линкове с плавен hover + мек glow |
| **`AmbientBackground`** (`ambient-*` в CSS) | Глобален фиксиран фон: плаващи blur градиенти, светещи орби, частици, стъклен воал (`layout.tsx`) |

### Движение и достъпност

Анимациите на mesh, shimmer и **глобалния ambient фон** са намалени при **`prefers-reduced-motion: reduce`** — blob-овете и орбите спират да се движат, shimmer се изключва. За критичен контент не разчитайте само на анимация.

## Framer Motion

- Зависимост: **`framer-motion`** (виж `package.json`).
- **`src/app/template.tsx`** — при навигация: **кинематографски enter** (opacity, лек scale ~0.985, blur 10px → 0); уважава `useReducedMotion()`.
- **`src/lib/motion.ts`** — easing-и и варианти: `easeCinematic`, `easeLux`, `transitionCinematic`, `pageEnterFrom` / `pageEnterReduced`, `listContainerVariants`, `listItemVariants`, `viewportFadeUpVariants` (с лек blur при scroll-in), `staggerInViewContainer`.
- **`src/components/ai-avatar.tsx`** — градиентен „AI“ аватар (икона по подразбиране `Sparkles`) за navbar и акценти.
- **Начална страница** (`page.tsx`), **табло** (`dashboard/page.tsx`), **навигация** (`navbar.tsx`), **чат** (`faculty/agromind/page.tsx`) — входни анимации / stagger; където е уместно **`useReducedMotion()`**.

## Премиум / кинематографски слой

- **`body.cinematic-ui`** (в `layout.tsx`) — фиксиран **film grain** (`::after`, `mix-blend-mode: overlay`, нисък z-index под навигацията).
- **`.cinematic-vignette`** — inset сенки за „обективна“ винетка (ползва се като абсолютен слой в hero).
- **`.ai-glow-breathe`** — бавен пулс на светлина около AI акценти (напр. етикет в hero).
- **`ai-panel::before`** — леко „дишане“ на градиентната рамка (`ai-panel-border-breathe`).
- **`@theme`**: `--ease-cinematic`, `--ease-lux`, `--duration-slow`, `--duration-cinematic` — за CSS `transition-*` и Framer easing-и в един стил.

При **`prefers-reduced-motion: reduce`** grain се намалява, `ai-glow-breathe` и пулсът на рамката на `ai-panel` се изключват; **ambient** орби и blob drift също са статични.
