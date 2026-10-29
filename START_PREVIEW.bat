@echo off
cd /d "%~dp0"
echo Portfolio preview: http://localhost:4175
echo Keep this window open. Press Ctrl+C to stop.
where py >nul 2>nul
if not errorlevel 1 (
  start "Open Portfolio" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:4175"
  py -3 -m http.server 4175 --bind 127.0.0.1
  goto :end
)
where python >nul 2>nul
if not errorlevel 1 (
  start "Open Portfolio" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:4175"
  python -m http.server 4175 --bind 127.0.0.1
  goto :end
)
echo Python 3 was not found. Install Python 3, then run this file again.
pause
:end
