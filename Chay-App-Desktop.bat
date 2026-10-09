 @echo off
chcp 65001 >nul
title CHESSVERSE - Đang Khởi Động Ứng Dụng Desktop...
cd /d "%~dp0"
echo ===================================================
echo     👑 CHESSVERSE (BÁCH KỲ TRẬN) - DESKTOP APP
echo ===================================================
echo.
echo Đang mở ứng dụng cửa sổ Desktop...
npx electron electron/main.cjs
if errorlevel 1 (
    echo.
    echo Không mở được Electron, đang mở trên trình duyệt...
    start http://localhost:5173/
)
