@echo off
chcp 65001 >nul
title CHESSVERSE - Trình Duyệt Web
cd /d "%~dp0"
echo ===================================================
echo     🌐 CHESSVERSE - MỞ TRÊN TRÌNH DUYỆT WEB
echo ===================================================
echo.
echo Đang mở trình duyệt tại http://localhost:5173/ ...
start http://localhost:5173/
npm run dev
