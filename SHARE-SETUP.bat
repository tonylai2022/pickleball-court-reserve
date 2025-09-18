@echo off
color 2
cls
echo.
echo 🚀 WeChat Mini Program Ready for Sharing!
echo ══════════════════════════════════════════════════════════
echo.
echo 📱 Your Pickleball Court Reservation app is complete with:
echo.
echo    ✅ 4 Complete Pages (Home, Booking, Payment, Success)
echo    ✅ TRK Restaurant Integration  
echo    ✅ WeChat Pay/Alipay/Bank Card Payments
echo    ✅ Local Court Image (images/court.jpeg)
echo    ✅ Comprehensive Success Page with Voucher
echo    ✅ Chinese Localization
echo    ✅ Phone-Ready Responsive Design
echo.
color 6
echo 🎯 SHARING OPTIONS:
echo.
echo [1] Create Share Package (Zip folder for others)
echo [2] Generate QR Code for Phone Testing  
echo [3] View Sharing Instructions
echo [4] Test Locally First
echo [5] Exit
echo.
set /p choice="Choose option (1-5): "

if "%choice%"=="1" goto :create_package
if "%choice%"=="2" goto :qr_code  
if "%choice%"=="3" goto :instructions
if "%choice%"=="4" goto :local_test
if "%choice%"=="5" goto :exit

:create_package
color 3
echo.
echo 📦 Creating share package...
call create-share-package.bat
goto :end

:qr_code
color 1
echo.
echo 📱 To generate QR code for phone testing:
echo.
echo 1. Open WeChat Developer Tools
echo 2. Import this project (App ID: wx3ab26b68d1115d4e)
echo 3. Click "Preview" button (预览)
echo 4. QR code appears - share this with testers
echo 5. Anyone can scan with WeChat app to test!
echo.
echo 💡 This is the EASIEST way for others to test your app!
echo.
goto :end

:instructions
color 5
echo.
echo 📖 Opening sharing documentation...
start SHARING-GUIDE.md
start TESTING-INSTRUCTIONS.md
echo.
echo ✅ Share these files with your testers:
echo    - SHARING-GUIDE.md (for developers)
echo    - TESTING-INSTRUCTIONS.md (for end users)
echo.
goto :end

:local_test
color 4
echo.
echo 🧪 To test locally:
echo.
echo 1. Run: GET-WECHAT-TOOLS.bat
echo 2. Download WeChat Developer Tools
echo 3. Import project with App ID: wx3ab26b68d1115d4e
echo 4. Test in simulator or generate QR code
echo.
echo ⚠️  Don't use browsers or PowerShell scripts!
echo.
goto :end

:exit
echo.
echo 👋 Goodbye! Your WeChat Mini Program is ready to share.
goto :end

:end
color 7
echo.
echo 📋 Quick Sharing Summary:
echo.
echo 🎯 Best Methods:
echo    1. QR Code: Generate in WeChat Developer Tools → Share QR image
echo    2. Zip Package: Run option 1 above → Share WeChat-Pickleball-Share.zip
echo.
echo 📞 Support Files Created:
echo    ✅ SHARING-GUIDE.md (detailed setup)
echo    ✅ TESTING-INSTRUCTIONS.md (for testers)  
echo    ✅ GET-WECHAT-TOOLS.bat (auto-download tools)
echo.
echo 🎉 Your app is professional and ready for testing!
echo.
pause
