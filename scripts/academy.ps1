# Отвори PowerShell където и да е, после изпълни:
#   & "C:\Users\expre\Academy\scripts\academy.ps1"
# (пътят е пример — смени го ако репото е другаде.)
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot
Write-Host "Работна директория: $repoRoot" -ForegroundColor Green
