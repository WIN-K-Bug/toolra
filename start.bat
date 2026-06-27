@echo off
cd /d "%~dp0"
echo ==========================================
echo           Toolra Startup Script
echo ==========================================

if not exist node_modules (
    echo [Toolra] node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [Toolra] Error installing dependencies.
        pause
        exit /b %errorlevel%
    )
)

echo [Toolra] Launching Vite development server...
call npm run dev
pause
