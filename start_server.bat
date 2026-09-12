@echo off
title Flipkart Data Arrange Local Server
cd /d "%~dp0"
echo ========================================================
echo Starting Flipkart Data Arrange Local Server...
echo ========================================================
echo.
echo Opening browser at http://127.0.0.1:5000
start http://127.0.0.1:5000
echo.
python app.py
pause
