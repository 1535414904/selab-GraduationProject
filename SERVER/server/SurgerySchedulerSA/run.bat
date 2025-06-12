@echo off
chcp 65001 > nul
echo [編譯中...] 請稍候...
g++ main.cpp io.cpp sa.cpp evaluator.cpp -o main.exe

if %errorlevel% GEQ 1 (
    echo 編譯失敗，請檢查錯誤訊息。
    pause
    exit /b
)

echo [執行中...]
main.exe
pause
