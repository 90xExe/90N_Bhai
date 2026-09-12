@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python 3.10 or newer is needed to refresh local desktop files.
  echo On GitHub, this is handled automatically after you push.
  pause
  exit /b 1
)
python scripts\build.py --index-only
if errorlevel 1 (
  echo Desktop update failed. Please review the error above.
) else (
  echo Desktop updated. Refresh index.html in your browser.
)
pause
