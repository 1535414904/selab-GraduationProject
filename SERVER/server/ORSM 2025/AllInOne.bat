@echo off
cd /d "%~dp0"
path "%CD%\JavaJdk\jdk1.8.0_202\bin"
set classpath=.;%CD%\TheJARs\pdfbox-app-3.0.0.jar
java SchedulingManager