# AI Design — единен визуален договор

Този документ е **източник на истина** за шрифтове, цветове, компоненти и стилови шаблони в **AI Agro Academy** (Next.js frontend).  
Ползвай го при: нов UI, рефакторинг, генериране от LLM, Figma/Code Connect, вътрешни „дизайн“ tool-ове и code review.

## Йерархия (какво е канонично)

| Приоритет | Файл / модул | Отговорност |
|-----------|----------------|-------------|
| 1 | `src/app/globals.css` → блок **`@theme`** | Цветови токени, радиуси, сенки, motion токени |
| 2 | `src/app/layout.tsx` | **Inter** (`next/font/google`) → CSS променлива `--font-sans` |
| 3 | `src/components/ui/*` | ShadCN (New York) — бутони, карти, полета |
| 4 | `src/lib/motion.ts` + **Framer Motion** | Easing, варианти за вход/scroll |
| 5 | `globals.css` (извън `@theme`) | `glass*`, `ai-*`, `ambient-*`, `nav-link-futuristic`, grain |
| 6 | `docs/DESIGN_SYSTEM.md` | Човешко описание + таблици (разширение на този договор) |

**Правило:** не въвеждай нови „официални“ цветове само в JSX. Ако липсва токен — първо добави го в `@theme`, после ползвай `bg-*` / `text-*`.

## Типография

- **Основен текст:** `font-sans` (body в `layout.tsx`).
- **Шрифт:** Inter, подмножества `latin` + `cyrillic` (български в същия семействен стек).
- **Йерархия:** `text-display` / lead / body / caption от `@theme` където има смисъл; иначе Tailwind `text-sm` … `text-5xl` със семантични цветове.
- **Моноширин:** `font-mono` — само за код, ID, технични етикети.

## Цветове (семантика)

Използвай **само** семантичните Tailwind класове, съпоставени на `@theme`:

- Фон / текст: `bg-background`, `text-foreground`, `text-muted-foreground`, `text-subtle-foreground`
- Акценти: `primary`, `accent`, `ring`
- Повърхности: `card`, `popover`, `muted`, `border`, `input`
- Статуси: `destructive`, `success`, `warning`, `info`
- Тъмни ленти / hero върху градиент: `band`, `band-foreground`

**Забранено за нов код:** произволни `text-[#...]`, `bg-[#...]` освен ако е **legacy екран** в активна миграция — тогава маркирай с коментар и отвори задача за пренос към токени.

### Светъл app shell (`app-*`)

За **курс**, **auth** и светли карти: `bg-app-surface`, `text-app-ink`, `text-app-ink-muted`, `border-app-border`, `bg-app-card`, `text-app-primary`, `hover:text-app-primary-hover`, `bg-app-success-bg`, `text-app-placeholder`, `bg-app-navy-mid` (градиенти). Споделени класове за полета: **`src/lib/app-shell-classes.ts`**.

## Компоненти

- Импорт от `@/components/ui/...` (`Button`, `Card`, `Input`, `Label`, `Badge`, …).
- Варианти на бутони: виж `button.tsx` — включително `neon` за AI акценти.
- **Lucide** за иконки — съгласуван размер с бутона/текста.

## Фон и атмосфера

- Глобален фон: `AmbientBackground` в `layout.tsx` + класове `ambient-*` в `globals.css`.
- Локални hero секции: `ai-mesh` / `ai-mesh-blob`, `cinematic-vignette`, `slanted-bg`.
- Карти / панели: `glass`, `glass-strong`, `glass-float`, `ai-panel`.

## Движение

- Странични преходи: `src/app/template.tsx`.
- Easing / variants: `src/lib/motion.ts`; в компоненти — `useReducedMotion()` от Framer Motion където има анимация.

## Достъпност

- Фокус: видим `ring` (напр. `focus-visible:ring-2 focus-visible:ring-ring/50`).
- Контраст: основен текст `foreground` върху `background`.
- **`prefers-reduced-motion`:** не разчитай само на анимация за смисъл; CSS анимации в проекта са смекчени в `globals.css`.

## Чеклист за нов екран

1. [ ] `bg-background` / `text-foreground` (или `font-sans` контейнер).
2. [ ] Няма нови hex без токен.
3. [ ] ShadCN компоненти за интерактивни елементи.
4. [ ] Иконки Lucide.
5. [ ] Motion с `useReducedMotion` при нужда.
6. [ ] `npm run build` без грешки.

## Връзки

- Подробности и примери: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- Тема и utility дефиниции: `src/app/globals.css`
- **Преглед на съответствие (шрифтове, hex, зони):** [AI_DESIGN_AUDIT.md](./AI_DESIGN_AUDIT.md)
