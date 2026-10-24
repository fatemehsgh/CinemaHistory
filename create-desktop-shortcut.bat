@echo off
chcp 65001 >nul
powershell -ExecutionPolicy Bypass -File "%~dp0create-desktop-shortcut.ps1"
echo.
echo عملیات با موفقیت انجام شد! آیکون سینما لاگ روی دسک‌تاپ شما قرار گرفت.
pause
