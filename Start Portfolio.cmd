@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python 3.10 or newer is needed for the local preview.
  echo The hosted GitHub Pages website does not need Python.
  pause
  exit /b 1
)
python scripts\preview.py
if errorlevel 1 pause
