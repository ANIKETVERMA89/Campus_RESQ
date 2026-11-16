@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start_windows.ps1"
if errorlevel 1 (
  echo.
  echo Campus RESQ did not start. Read the error above.
  pause
)
