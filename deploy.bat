@echo off
cd /d %~dp0

echo ================================
echo   BUILDING PROJECT...
echo ================================

call npm run build

if %errorlevel% neq 0 (
  echo Build failed!
  pause
  exit /b
)

echo.
echo ================================
echo   COMMIT LOCAL CHANGES...
echo ================================

git add .
git commit -m "update viewer"
git push

echo.
echo ================================
echo   DEPLOYING TO GITHUB PAGES...
echo ================================

call npm run deploy

if %errorlevel% neq 0 (
  echo Deploy failed!
  pause
  exit /b
)

echo.
echo ================================
echo   DONE! 🚀
echo ================================

timeout /t 2 > nul

start "" https://github.com/WebGLSteelworks/Vanguard04.git

pause