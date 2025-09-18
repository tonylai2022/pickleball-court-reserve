# WeChat Mini Program Deployment Helper
# PowerShell script to prepare and guide deployment

Write-Host "===========================================" -ForegroundColor Red
Write-Host "⚠️  IMPORTANT TESTING NOTICE" -ForegroundColor Red  
Write-Host "===========================================" -ForegroundColor Red
Write-Host ""
Write-Host "❌ DO NOT run WeChat Mini Program code in browsers or Node.js!" -ForegroundColor Yellow
Write-Host "❌ The errors you see (App is not defined, getApp is not defined) are normal" -ForegroundColor Yellow
Write-Host "❌ when running outside WeChat environment." -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ PROPER TESTING METHOD:" -ForegroundColor Green
Write-Host "1. Download WeChat Developer Tools" -ForegroundColor Cyan
Write-Host "2. Import this project folder" -ForegroundColor Cyan
Write-Host "3. Test in WeChat simulator" -ForegroundColor Cyan
Write-Host "4. Use Preview/Upload for phone testing" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "app.js")) {
    Write-Host "❌ ERROR: Not in WeChat Mini Program project directory!" -ForegroundColor Red
    Write-Host "Please run this script from your project root." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📁 Project Directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Check essential files
Write-Host "🔍 Checking project files..." -ForegroundColor Yellow

$files = @(
    @{Path="app.js"; Name="Main App Logic"},
    @{Path="app.json"; Name="App Configuration"},
    @{Path="app.wxss"; Name="Global Styles"},
    @{Path="pages\index\index.wxml"; Name="Home Page"},
    @{Path="pages\booking\booking.wxml"; Name="Booking Page"},
    @{Path="pages\payment\payment.wxml"; Name="Payment Page"},
    @{Path="pages\success\success.wxml"; Name="Success Page"}
)

$allGood = $true
foreach ($file in $files) {
    if (Test-Path $file.Path) {
        Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($file.Name) - MISSING!" -ForegroundColor Red
        $allGood = $false
    }
}

# Check images
Write-Host ""
Write-Host "🖼️ Checking images..." -ForegroundColor Yellow
if (Test-Path "images\court.jpeg") {
    Write-Host "  ✅ Court Image" -ForegroundColor Green
} else {
    Write-Host "  ❌ Court Image - MISSING!" -ForegroundColor Red
    $allGood = $false
}

# Check project config
Write-Host ""
Write-Host "⚙️ Checking configuration..." -ForegroundColor Yellow
if (Test-Path "project.config.json") {
    Write-Host "  ✅ Project Config" -ForegroundColor Green
} else {
    Write-Host "  ❌ Project Config - MISSING!" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "project.private.config.json") {
    $config = Get-Content "project.private.config.json" | ConvertFrom-Json
    if ($config.appid) {
        Write-Host "  ✅ App ID: $($config.appid)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ App ID not configured!" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
if ($allGood) {
    Write-Host "🎉 Project ready for deployment!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Please fix missing files before deployment." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT OPTIONS:" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔥 QUICK TESTING (Your phone only):" -ForegroundColor Yellow
Write-Host "1. Open WeChat Developer Tools"
Write-Host "2. Load project from this folder"
Write-Host "3. Click 'Preview' button"
Write-Host "4. Scan QR code with your WeChat"
Write-Host ""

Write-Host "👥 TEAM TESTING (Share with others):" -ForegroundColor Yellow
Write-Host "1. Open WeChat Developer Tools"
Write-Host "2. Click 'Upload' button"
Write-Host "3. Enter version info (e.g., 1.0.0)"
Write-Host "4. Go to mp.weixin.qq.com"
Write-Host "5. Set uploaded version as 'Experience Version'"
Write-Host "6. Add test users in 'Experience Members'"
Write-Host "7. Generate and share Experience QR Code"
Write-Host ""

Write-Host "🌍 PUBLIC RELEASE:" -ForegroundColor Yellow
Write-Host "1. Upload version"
Write-Host "2. Submit for WeChat review"
Write-Host "3. Wait for approval"
Write-Host "4. Get official QR code"
Write-Host ""

Write-Host "📱 TESTING CHECKLIST:" -ForegroundColor Cyan
Write-Host "  □ Home page displays court image"
Write-Host "  □ TRK address shows correctly"
Write-Host "  □ Booking flow works end-to-end"
Write-Host "  □ Payment simulation completes"
Write-Host "  □ Success page confirmation works"
Write-Host "  □ All navigation buttons work"
Write-Host "  □ Phone/map features work on device"
Write-Host ""

$choice = Read-Host "Would you like to open WeChat Developer Tools now? (y/n)"
if ($choice -eq 'y' -or $choice -eq 'Y') {
    Write-Host ""
    Write-Host "🚀 Attempting to open WeChat Developer Tools..." -ForegroundColor Green
    
    # Common WeChat Developer Tools paths
    $wechatPaths = @(
        "${env:USERPROFILE}\AppData\Local\微信web开发者工具\微信web开发者工具.exe",
        "C:\Program Files (x86)\Tencent\微信web开发者工具\微信web开发者工具.exe",
        "C:\Program Files\Tencent\微信web开发者工具\微信web开发者工具.exe",
        "${env:USERPROFILE}\Desktop\微信web开发者工具\微信web开发者工具.exe"
    )
    
    $found = $false
    foreach ($path in $wechatPaths) {
        if (Test-Path $path) {
            Start-Process $path
            Write-Host "✅ WeChat Developer Tools opened!" -ForegroundColor Green
            $found = $true
            break
        }
    }
    
    if (!$found) {
        Write-Host "❌ WeChat Developer Tools not found in common locations." -ForegroundColor Red
        Write-Host "Please open it manually and load this project folder:" -ForegroundColor Yellow
        Write-Host "$(Get-Location)" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "📖 For detailed instructions, see: DEPLOYMENT-GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
