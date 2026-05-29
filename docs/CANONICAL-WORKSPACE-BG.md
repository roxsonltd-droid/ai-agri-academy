# Канонична работна папка — `C:\Users\expre\Academy`

Целият монорепо (**AI Agri Academy** / AgriNexus `apps/*`, `content/`, `docker-compose.yml`, …) трябва да живее на диска тук:

**`C:\Users\expre\Academy`**

Така терминалите, Cursor и скриптовете винаги сочат към едно и също копие; GitHub източникът остава [roxsonltd-droid/ai-agri-academy](https://github.com/roxsonltd-droid/ai-agri-academy).

## Първо клониране (празна папка)

```powershell
New-Item -ItemType Directory -Path "C:\Users\expre\Academy" -Force | Out-Null
cd C:\Users\expre\Academy
git clone https://github.com/roxsonltd-droid/ai-agri-academy.git .
```

(Ако папката не е празна, клонирай в подпапка и премести съдържанието, или използвай друг временен път.)

## Вече имаш репо на `Desktop\проект\…` или `Desktop\project\…`

1. Затвори IDE/терминали, отворени върху старата папка.
2. Премести (или копирай) цялото съдържание в `C:\Users\expre\Academy` така, че там да има `.git` и `package.json` в корена.
3. Алтернатива без преместване: **junction** от кириличен път към `C:\Users\expre\Academy` — виж `scripts\windows\link-cyrillic-desktop-folder.ps1` (по подразбиране целта е този път).

## Бърз терминал в корена

Двоен клик на **`Open-Academy-Terminal.cmd`** в корена на репото (след клониране) отваря `cmd` вече в `C:\Users\expre\Academy`, ако папката съществува.

## Свързани документи

- [`LOCAL-DEV.md`](./LOCAL-DEV.md) — Docker, Next, FastAPI, mobile.
- [`WORKSPACE-CYRILLIC-PATH-BG.md`](./WORKSPACE-CYRILLIC-PATH-BG.md) — кирилица `проект` срещу ASCII и junction.
