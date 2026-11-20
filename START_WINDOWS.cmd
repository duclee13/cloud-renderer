@echo off
setlocal
cd /d "%~dp0web-studio"
where node >nul 2>&1
if errorlevel 1 (
  echo Can cai Node.js 20 tro len.
  pause
  exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])<20)process.exit(1)"
if errorlevel 1 (
  echo Can Node.js 20 tro len.
  pause
  exit /b 1
)
if not exist "node_modules\.bin\next.cmd" (
  call npm ci
  if errorlevel 1 (
    echo Cai thu vien that bai. Xem loi npm ben tren.
    pause
    exit /b 1
  )
)
echo TOOL 2D ANIM - API FIX 1 - http://localhost:3000
call npm run dev -- --port 3000
pause
