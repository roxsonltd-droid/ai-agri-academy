@echo off
REM Двоен клик — нов PowerShell прозорец с работна папка = корен на репото.
cd /d "%~dp0"
start powershell -NoExit -Command ". .\python\Scripts\activate.ps1"
