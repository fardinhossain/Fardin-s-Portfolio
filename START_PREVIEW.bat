@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22 or later to run the local website and chat backend.
  echo Or open PREVIEW.html for a static inspection without a server.
  pause
  exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])<22)process.exit(1)"
if errorlevel 1 (
  echo Node.js 22 or later is required.
  pause
  exit /b 1
)
set PORT=4175
echo Portfolio and chat backend: http://localhost:4175
echo Chat remains unconfigured until AI_API_KEY and AI_MODEL are set in .env.
echo Keep this window open. Press Ctrl+C to stop.
start "Open Portfolio" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:4175"
node server/dev-server.mjs
