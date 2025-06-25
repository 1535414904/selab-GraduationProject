@echo off
cd /d "D:\SurgerySchedulerSA"

:: 建立 classpath（含 lib 資料夾中所有 .jar 檔）
setlocal EnableDelayedExpansion
set "classpath=."

for %%j in (lib\*.jar) do (
    set "classpath=!classpath!;%%j"
)

:: 編譯 Main.java
echo 正在編譯 Main.java ...
javac -cp "!classpath!" Main.java
if errorlevel 1 (
    echo 編譯失敗，請檢查錯誤訊息。
    pause
    exit /b
)

:: 執行程式
echo 執行程式中 ...
java -cp "!classpath!" Main

pause
