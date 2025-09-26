@echo off
REM Backend Setup Script for Pickleball Court Booking System (Windows)
echo 🏓 Setting up Pickleball Court Booking Backend...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Create necessary directories
echo 📁 Creating directories...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "uploads\courts" mkdir uploads\courts
if not exist "uploads\users" mkdir uploads\users
echo ✅ Directories created

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

REM Copy environment file if it doesn't exist
if not exist ".env" (
    echo 📄 Creating .env file from template...
    copy ".env.example" ".env"
    echo ✅ .env file created from template
    echo ⚠️  Please update the .env file with your actual configuration values
) else (
    echo ✅ .env file already exists
)

REM Database initialization info
echo 🗄️  Database initialization...
echo 💡 Make sure MongoDB is running before starting the server

REM Check if MongoDB is available
mongosh --version >nul 2>&1
if errorlevel 1 (
    mongo --version >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  MongoDB CLI not found. Please ensure MongoDB is installed and running
    ) else (
        echo ✅ MongoDB CLI (mongo) is available
    )
) else (
    echo ✅ MongoDB CLI (mongosh) is available
)

echo.
echo 🎉 Backend setup completed!
echo.
echo Next steps:
echo 1. Update .env file with your configuration
echo 2. Make sure MongoDB is running
echo 3. Start the server with: npm run dev
echo.
echo 🔧 Available scripts:
echo   npm run dev     - Start development server with nodemon
echo   npm start       - Start production server
echo   npm run test    - Run tests
echo.
echo 📖 API Documentation will be available at: http://localhost:3000/api
echo 🏥 Health check: http://localhost:3000/health
echo.
pause