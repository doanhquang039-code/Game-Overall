@echo off
chcp 65001 >nul
title Mở Dự Án Android Trong Android Studio
cd /d "%~dp0"
echo ===================================================
echo     🤖 MỞ DỰ ÁN ANDROID TRONG ANDROID STUDIO
echo ===================================================
echo.
echo Đang đồng bộ và mở Android Studio...
npx cap open android
