@echo off
REM Opens cmd in the canonical Academy monorepo folder (see docs/CANONICAL-WORKSPACE-BG.md).
set "ROOT=C:\Users\expre\Academy"
if exist "%ROOT%\.git" (
  cd /d "%ROOT%"
) else if exist "%~dp0.git" (
  cd /d "%~dp0"
) else (
  echo Missing repo: create %ROOT% and clone https://github.com/roxsonltd-droid/ai-agri-academy or open this .cmd from repo root.
  pause
  exit /b 1
)
title AI Agri Academy
cmd /k
