@echo off
echo 📦 Preparing WeChat Mini Program for Sharing...
echo.

:: Create a sharing package
set SHARE_DIR=WeChat-Pickleball-Share
if exist %SHARE_DIR% rmdir /s /q %SHARE_DIR%
mkdir %SHARE_DIR%

echo ✅ Copying essential files...

:: Copy all WeChat Mini Program files
xcopy app.js %SHARE_DIR%\ /Y
xcopy app.json %SHARE_DIR%\ /Y  
xcopy app.wxss %SHARE_DIR%\ /Y
xcopy project.config.json %SHARE_DIR%\ /Y
xcopy sitemap.json %SHARE_DIR%\ /Y

:: Copy pages directory
xcopy pages %SHARE_DIR%\pages\ /E /I /Y

:: Copy images directory
xcopy images %SHARE_DIR%\images\ /E /I /Y

:: Copy setup tools and guides
xcopy GET-WECHAT-TOOLS.bat %SHARE_DIR%\ /Y
xcopy SHARING-GUIDE.md %SHARE_DIR%\ /Y
xcopy READ-THIS-FIRST.md %SHARE_DIR%\ /Y
xcopy PROPER-TESTING-GUIDE.md %SHARE_DIR%\ /Y

echo.
echo 🎯 Creating recipient instructions...

:: Create simple setup file for recipients
echo @echo off > %SHARE_DIR%\START-HERE.bat
echo echo 🚀 WeChat Mini Program - Pickleball Court Reservation >> %SHARE_DIR%\START-HERE.bat
echo echo ================================================== >> %SHARE_DIR%\START-HERE.bat
echo echo. >> %SHARE_DIR%\START-HERE.bat
echo echo 📋 App Details: >> %SHARE_DIR%\START-HERE.bat
echo echo    App ID: wx3ab26b68d1115d4e >> %SHARE_DIR%\START-HERE.bat
echo echo    Name: Pickleball Court Reservation >> %SHARE_DIR%\START-HERE.bat
echo echo    Venue: TRK·达鲁酷运动餐酒吧^(友邦金融中心店^) >> %SHARE_DIR%\START-HERE.bat
echo echo. >> %SHARE_DIR%\START-HERE.bat
echo echo 🛠️  Quick Setup: >> %SHARE_DIR%\START-HERE.bat
echo echo 1. Run: GET-WECHAT-TOOLS.bat >> %SHARE_DIR%\START-HERE.bat
echo echo 2. Install WeChat Developer Tools >> %SHARE_DIR%\START-HERE.bat
echo echo 3. Import this project folder >> %SHARE_DIR%\START-HERE.bat
echo echo 4. Use App ID: wx3ab26b68d1115d4e >> %SHARE_DIR%\START-HERE.bat
echo echo 5. Test in simulator or generate QR code for phone >> %SHARE_DIR%\START-HERE.bat
echo echo. >> %SHARE_DIR%\START-HERE.bat
echo echo 📖 For detailed instructions, read: SHARING-GUIDE.md >> %SHARE_DIR%\START-HERE.bat
echo echo. >> %SHARE_DIR%\START-HERE.bat
echo pause >> %SHARE_DIR%\START-HERE.bat

:: Create README for sharing
echo # 📱 WeChat Mini Program - Pickleball Court Reservation > %SHARE_DIR%\README.md
echo. >> %SHARE_DIR%\README.md
echo ## 🚀 Quick Start >> %SHARE_DIR%\README.md
echo. >> %SHARE_DIR%\README.md
echo 1. **Double-click: `START-HERE.bat`** >> %SHARE_DIR%\README.md
echo 2. **Follow the setup instructions** >> %SHARE_DIR%\README.md
echo 3. **Import with App ID: `wx3ab26b68d1115d4e`** >> %SHARE_DIR%\README.md
echo. >> %SHARE_DIR%\README.md
echo ## 📋 App Features >> %SHARE_DIR%\README.md
echo. >> %SHARE_DIR%\README.md
echo - ✅ **4 Complete Pages**: Home, Booking, Payment, Success >> %SHARE_DIR%\README.md
echo - ✅ **TRK Restaurant Integration** >> %SHARE_DIR%\README.md  
echo - ✅ **WeChat Pay/Alipay/Bank Card** payments >> %SHARE_DIR%\README.md
echo - ✅ **Phone-ready responsive design** >> %SHARE_DIR%\README.md
echo - ✅ **Chinese localization** >> %SHARE_DIR%\README.md
echo. >> %SHARE_DIR%\README.md
echo ## 🔧 Testing >> %SHARE_DIR%\README.md
echo. >> %SHARE_DIR%\README.md
echo **Only use WeChat Developer Tools** - browsers won't work! >> %SHARE_DIR%\README.md
echo. >> %SHARE_DIR%\README.md
echo For detailed setup: see `SHARING-GUIDE.md` >> %SHARE_DIR%\README.md

echo.
echo ✅ Share package created in: %SHARE_DIR%\
echo.
echo 🎯 Next steps:
echo    1. Zip the '%SHARE_DIR%' folder 
echo    2. Share the zip file with testers
echo    3. Recipients run START-HERE.bat
echo    4. They import with App ID: wx3ab26b68d1115d4e
echo.
echo 💡 Alternative: Generate QR code in WeChat Developer Tools
echo    - Click "Preview" to create QR code
echo    - Share QR code image for instant phone testing
echo.
pause
