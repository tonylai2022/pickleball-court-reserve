@echo off
echo.
echo ==============================================
echo 🏓 Pickleball Court Reservation - WeChat Mini Program
echo ==============================================
echo.

set "PROJECT_PATH=%~dp0"
echo 📁 Project Location: %PROJECT_PATH%

REM Check for WeChat Developer Tools
set "WECHAT_PATH1=C:\Users\%USERNAME%\AppData\Local\微信开发者工具\wechatwebdevtools.exe"
set "WECHAT_PATH2=C:\Program Files (x86)\Tencent\微信web开发者工具\wechatwebdevtools.exe"

if exist "%WECHAT_PATH1%" (
    echo ✅ WeChat Developer Tools found!
    echo 🚀 Starting WeChat Developer Tools...
    start "" "%WECHAT_PATH1%" "%PROJECT_PATH%"
    goto :success
)

if exist "%WECHAT_PATH2%" (
    echo ✅ WeChat Developer Tools found!
    echo 🚀 Starting WeChat Developer Tools...  
    start "" "%WECHAT_PATH2%" "%PROJECT_PATH%"
    goto :success
)

echo ❌ WeChat Developer Tools not found!
echo.
echo 📥 Please download from:
echo https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
echo.
echo 🔄 Manual Steps:
echo 1. Download and install WeChat Developer Tools
echo 2. Open WeChat Developer Tools
echo 3. Click 'Import Project'
echo 4. Select this folder: %PROJECT_PATH%
echo 5. Use App ID: wxtest123456789
echo 6. Project Name: Pickleball Court Reservation
echo.

REM Alternative: Open web version
set /p choice="Would you like to open the web version for basic testing? (y/n): "
if /i "%choice%"=="y" (
    if exist "%PROJECT_PATH%index.html" (
        echo 🌐 Opening web version...
        start "" "%PROJECT_PATH%index.html"
    ) else (
        echo ❌ Web version not found
    )
)

:success
echo.
echo 📋 Quick Testing Checklist:
echo   ✅ Home page loads
echo   ✅ Court selection works
echo   ✅ Booking flow completes  
echo   ✅ Payment options display
echo   ✅ Success page shows booking
echo.
echo 🔧 Test Commands in WeChat DevTools Console:
echo   const test = require('./test.js')
echo   test.runAllTests()
echo.
echo 📱 Test App ID: wxtest123456789
echo 🎯 Target: Chinese Pickleball Market
echo.

pause
