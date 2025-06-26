@echo off
cd /d "D:\SurgerySchedulerSA"

:: 組合 lib 資料夾內的所有 jar 檔案成 classpath
setlocal EnableDelayedExpansion
set "classpath=."
for %%j in (lib\*.jar) do (
    set "classpath=!classpath!;%%j"
)

:: 編譯 Main.java
javac -cp "!classpath!" Main.java
if errorlevel 1 (
    echo 編譯失敗，請檢查錯誤
    pause
    exit /b
)

:: 執行主程式
echo 執行模擬退火...
java -cp "!classpath!" Main
pause
if errorlevel 1 (
    echo 執行失敗，請檢查錯誤
    pause
    exit /b
)