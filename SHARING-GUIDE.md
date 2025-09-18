# 📱 Share Your WeChat Mini Program for Testing

## 🎯 Quick Share Method (Recommended)

### For WeChat Developer Tools Users:
1. **Open your project in WeChat Developer Tools**
2. **Click "Preview" button** (预览)
3. **QR Code appears** - others scan with WeChat app
4. **Instant testing on real phones!**

### For Non-Developers:
1. **Zip this entire folder**
2. **Share the zip file**
3. **Recipients follow setup instructions below**

## 📦 Project Package for Sharing

### What to Share:
- **Entire project folder**: `pickleball_court_reserve`
- **Important files included**:
  - All WeChat Mini Program files (`.wxml`, `.wxss`, `.js`)
  - `images/court.jpeg` (local court image)
  - `project.config.json` (project settings)
  - Setup guides and documentation

### App Details for Recipients:
- **App ID**: `wx3ab26b68d1115d4e`
- **Project Name**: `Pickleball Court Reservation`
- **Venue**: TRK·达鲁酷运动餐酒吧(友邦金融中心店)

## 🛠️ Setup Instructions for Recipients

### Step 1: Get WeChat Developer Tools
```bash
# Run this file to download WeChat Developer Tools
GET-WECHAT-TOOLS.bat
```
Or manual download: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### Step 2: Import Project
1. **Open WeChat Developer Tools**
2. **Click "Import Project" (导入项目)**
3. **Select project folder**: `pickleball_court_reserve`
4. **Enter App ID**: `wx3ab26b68d1115d4e`
5. **Project Name**: `Pickleball Court Reservation`
6. **Click "Import"**

### Step 3: Test Methods

#### Method A: Simulator Testing
- Use **left panel simulator** for desktop testing
- Navigate through all 4 pages
- Test booking flow and payments

#### Method B: Phone Testing  
- Click **"Preview" button** in WeChat Developer Tools
- **Scan QR code** with WeChat app on phone
- Test directly on real device!

#### Method C: Share QR Code
- Generate QR code via "Preview"
- **Share QR code image** with other testers
- Anyone with WeChat can scan and test

## 📋 Testing Checklist for Recipients

### ✅ Core Features to Test:
- [ ] **Home page loads** with TRK address and court image
- [ ] **Date/time selection** works on booking page
- [ ] **Payment options** display (WeChat Pay, Alipay, Bank Card)
- [ ] **Success page** shows booking confirmation
- [ ] **Navigation** between all pages works
- [ ] **Responsive design** adapts to different screen sizes

### 📱 Phone-Specific Tests:
- [ ] **Touch interactions** work smoothly  
- [ ] **Scrolling** is responsive
- [ ] **Text sizing** is appropriate
- [ ] **Button tapping** is accurate
- [ ] **Form inputs** work correctly

## 🚀 Quick Start Commands for Recipients

### Windows Users:
```batch
# Double-click to get WeChat tools
GET-WECHAT-TOOLS.bat

# Read setup instructions
READ-THIS-FIRST.md
```

### After Setup in WeChat Developer Tools:
1. **Import project** with App ID: `wx3ab26b68d1115d4e`
2. **Click "Compile" (编译)** to build
3. **Use simulator** or **click "Preview"** for phone testing

## 💡 Troubleshooting for Recipients

### Common Issues:
- **"App is not defined" errors**: Normal when not using WeChat Developer Tools
- **Can't open files**: Don't use browsers - use WeChat Developer Tools only
- **QR code expired**: Generate new one via "Preview" button
- **Import failed**: Check App ID is exactly `wx3ab26b68d1115d4e`

### Solutions:
- ✅ **Only use WeChat Developer Tools** for testing
- ✅ **Import entire project folder** not individual files  
- ✅ **Use correct App ID** for import
- ✅ **Generate fresh QR codes** for phone testing

## 🔗 Sharing Options

### Option 1: Direct File Share
- Zip entire `pickleball_court_reserve` folder
- Share via email, WeChat, or cloud storage
- Include this guide (`SHARING-GUIDE.md`)

### Option 2: QR Code Share
- Open in WeChat Developer Tools
- Click "Preview" to generate QR code
- Share QR code image for instant phone testing

### Option 3: GitHub/Git Repository
- Upload project to GitHub (if desired)
- Others can clone and import
- Include setup instructions in README

---

## 📞 Support for Recipients

If testers have issues:
1. **Read `READ-THIS-FIRST.md`** for detailed setup
2. **Run `GET-WECHAT-TOOLS.bat`** to download tools
3. **Use QR code method** for easiest testing
4. **Contact you** for additional support

**Your WeChat Mini Program is ready to share! 🎉**
