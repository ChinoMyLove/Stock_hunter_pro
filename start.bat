@echo off
REM ========================================================================
REM Stock Hunter Pro v2.0 - Windows Launcher
REM Professional Stock Analysis Platform
REM ========================================================================

echo.
echo   ███████╗████████╗ ██████╗  ██████╗██╗  ██╗    ██╗  ██╗██╗   ██╗███╗   ██╗████████╗███████╗██████╗ 
echo   ██╔════╝╚══██╔══╝██╔═══██╗██╔════╝██║ ██╔╝    ██║  ██║██║   ██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗
echo   ███████╗   ██║   ██║   ██║██║     █████╔╝     ███████║██║   ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝
echo   ╚════██║   ██║   ██║   ██║██║     ██╔═██╗     ██╔══██║██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗
echo   ███████║   ██║   ╚██████╔╝╚██████╗██║  ██╗    ██║  ██║╚██████╔╝██║ ╚████║   ██║   ███████╗██║  ██║
echo   ╚══════╝   ╚═╝    ╚═════╝  ╚═════╝╚═╝  ╚═╝    ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
echo.
echo                                      📈 Professional Stock Analysis Platform v2.0
echo                                         Implementing Minervini's Proven Methodology
echo.

REM Check if Python is installed
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Python is not installed or not in PATH
    echo.
    echo 📥 Please install Python 3.8+ from: https://python.org/downloads
    echo    Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

REM Get Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✅ Python %PYTHON_VERSION% detected

REM Check if we're in the correct directory
if not exist "app.py" (
    echo ❌ Error: app.py not found
    echo    Please run this script from the Stock Hunter Pro directory
    pause
    exit /b 1
)

echo ✅ Stock Hunter Pro directory confirmed

REM Check if virtual environment exists
if not exist "venv\" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if requirements are installed
pip show flask > nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing dependencies...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

REM Create necessary directories
if not exist "data\" mkdir data
if not exist "data\results\" mkdir data\results
if not exist "logs\" mkdir logs

echo ✅ Directory structure verified

REM Check backend health
echo 🔍 Testing backend connection...
python -c "
import sys
try:
    from utils.data_fetcher import DataFetcher
    from utils.minervini_criteria import MinerviniAnalyzer
    from utils.rs_calculator import RSCalculator
    from utils.file_handler import FileHandler
    print('✅ All modules imported successfully')
except ImportError as e:
    print(f'❌ Import error: {e}')
    sys.exit(1)
"

if %errorlevel% neq 0 (
    echo ❌ Backend modules not working properly
    pause
    exit /b 1
)

echo ✅ Backend modules verified

REM Start the Flask application
echo.
echo 🚀 Starting Stock Hunter Pro...
echo.
echo    📊 Professional Interface: http://localhost:5000
echo    🔗 API Documentation: http://localhost:5000/api/health
echo.
echo 💡 Tips:
echo    • Import CSV with stock symbols or use sample data
echo    • System supports parallel processing for faster analysis
echo    • Watchlist saves automatically to localStorage
echo.
echo 🛑 Press Ctrl+C to stop the server
echo.

timeout /t 3 > nul

REM Start Flask app and open browser
start "" "http://localhost:5000"
python app.py

REM Cleanup message
echo.
echo 👋 Stock Hunter Pro stopped. Thank you for using our platform!
pause