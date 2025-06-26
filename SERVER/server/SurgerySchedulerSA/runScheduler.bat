@echo off
cd /d "%~dp0"

rem 啟用延伸變數展開
setlocal enabledelayedexpansion

rem 收集 lib 資料夾下的所有 jar 檔案
set "classpath=."
for %%f in (lib\*.jar) do (
    set "classpath=!classpath!;%%f"
)

rem 編譯 Main.java
javac -cp "!classpath!" Main.java
if errorlevel 1 (
    echo 編譯失敗！
    exit /b 1
)

rem 執行 Main.class
java -cp "!classpath!" Main

endlocal
pause


