@echo off
REM Push Nova Rides to GitHub
REM Run from the project folder: push-to-github.bat

cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
    echo Git is not installed or not in PATH. Install from https://git-scm.com/
    pause
    exit /b 1
)

if not exist .git (
    echo Initializing git repository...
    git init
    git remote add origin https://github.com/novarides/Nova-Rides-.git
) else (
    git remote remove origin 2>nul
    git remote add origin https://github.com/novarides/Nova-Rides-.git
)

echo Staging all files...
git add .
echo Committing...
git commit -m "Initial commit: Nova Rides car sharing platform" 2>nul
git branch -M main
echo Pushing to origin main...
git push -u origin main
echo.
echo Done. Project: https://github.com/novarides/Nova-Rides-
pause
