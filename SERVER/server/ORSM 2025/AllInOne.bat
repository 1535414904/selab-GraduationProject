@echo off
echo Starting algorithm scheduling process...
cd /d "%~dp0"

REM Check Java environment variables
if not defined JAVA_HOME (
  echo JAVA_HOME not set, using local JDK
  set "JAVA_HOME=%CD%\JavaJdk\jdk1.8.0_202"
)

REM Set PATH
set "PATH=%JAVA_HOME%\bin;%PATH%"

REM Set library path
if not defined JAVA_LIBRARY_PATH (
  echo Setting default JAVA_LIBRARY_PATH
  set "JAVA_LIBRARY_PATH=%JAVA_HOME%\lib;%JAVA_HOME%\jre\lib;%JAVA_HOME%\jre\bin"
)

echo Using JAVA_HOME: %JAVA_HOME%
echo Using PATH: %PATH%
echo Using JAVA_LIBRARY_PATH: %JAVA_LIBRARY_PATH%

set "classpath=.;%CD%\TheJARs\pdfbox-app-3.0.0.jar"
java -Djava.library.path="%JAVA_LIBRARY_PATH%" SchedulingManager
if errorlevel 1 (
  echo Algorithm execution failed, error code: %errorlevel%
  exit /b %errorlevel%
) else (
  echo Algorithm execution completed successfully
)