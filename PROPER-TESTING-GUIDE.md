# WeChat Mini Program Testing Guide

## ❌ Error Explanation

The errors you're seeing:
```
ReferenceError: App is not defined
ReferenceError: getApp is not defined  
ReferenceError: WeixinJSBridge is not defined
```

These occur because you're trying to run WeChat Mini Program code outside of the proper WeChat environment.

## 🔍 Why These Errors Happen

### The Wrong Way ❌
- Running `test-launcher.ps1` or similar scripts
- Opening HTML files in regular browsers
- Using Node.js to run the JavaScript files
- Testing outside WeChat Developer Tools

### The Right Way ✅
- Using **WeChat Developer Tools** only
- Running in WeChat Mini Program simulator
- Testing on actual WeChat app via QR codes

## 📱 Proper Testing Methods

### Method 1: WeChat Developer Tools (Recommended)

1. **Download & Install WeChat Developer Tools**
   - Go to: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
   - Download for Windows
   - Install and login with WeChat account

2. **Open Your Project**
   - Click "Import Project"
   - Select folder: `C:\Users\sp990\Desktop\pickleball_court_reserve`
   - Enter App ID: `wx3ab26b68d1115d4e` (from your config)
   - Click "Import"

3. **Test in Simulator**
   - The left panel shows device simulator
   - Click through your app pages
   - Check console for any real errors

4. **Preview on Phone**
   - Click "Preview" button in toolbar
   - Scan QR code with WeChat app
   - Test on your actual phone

---

### Method 2: Upload for Team Testing

1. **Upload Version**
   - Click "Upload" in WeChat Developer Tools
   - Enter version: `1.0.0-beta`
   - Add description: "Court reservation system test"

2. **Set Experience Version**
   - Go to: https://mp.weixin.qq.com
   - Development → Development Management
   - Set uploaded version as "Experience Version"

3. **Add Test Users**
   - Go to: Users and Permissions → Experience Members
   - Add WeChat IDs of testers
   - Generate Experience QR Code

---

## 🛠️ Development Environment Setup

### Required Tools:
1. **WeChat Developer Tools** (Primary)
2. **Code Editor** (VS Code, etc.) - for editing only
3. **WeChat Account** - for testing and management

### Not Required/Won't Work:
- ❌ Browser testing
- ❌ Node.js testing  
- ❌ Custom test scripts
- ❌ HTML preview

---

## 🐛 Real vs Fake Errors

### ❌ Fake Errors (Ignore These):
```
ReferenceError: App is not defined
ReferenceError: getApp is not defined
ReferenceError: WeixinJSBridge is not defined
```
These happen when running outside WeChat environment.

### ✅ Real Errors (Fix These):
```
SyntaxError: Unexpected token
TypeError: Cannot read property 'name' of undefined
Reference errors for your own functions
```
These are actual code issues.

---

## 📋 Testing Checklist

### ✅ Before Testing:
- [ ] WeChat Developer Tools installed
- [ ] Project imported successfully
- [ ] No compilation errors in console
- [ ] All pages load in simulator

### ✅ Phone Testing:
- [ ] Preview QR code generated
- [ ] Scanned with WeChat successfully
- [ ] All pages navigate properly
- [ ] Booking flow works end-to-end
- [ ] Payment simulation completes
- [ ] Success page displays correctly

### ✅ Team Testing:
- [ ] Version uploaded to WeChat MP
- [ ] Experience version configured
- [ ] Test users added
- [ ] Experience QR code shared

---

## 🎯 Quick Start Commands

### Stop Using These ❌:
```bash
./test-launcher.ps1
./start-test.bat
node test.js
```

### Use This Instead ✅:
1. Open WeChat Developer Tools
2. Import project folder
3. Click "Preview" or "Upload"

---

## 📞 Support

### If You Get Stuck:
1. **WeChat Developer Tools Issues**: Check WeChat documentation
2. **Code Errors**: Check console in WeChat Developer Tools
3. **Deployment Issues**: Verify App ID and permissions
4. **Phone Testing Issues**: Ensure WeChat app is updated

### Resources:
- WeChat Mini Program Docs: https://developers.weixin.qq.com/miniprogram/dev/
- Admin Panel: https://mp.weixin.qq.com
- Developer Tools Download: https://developers.weixin.qq.com/miniprogram/dev/devtools/

---

## ✅ Summary

**The Bottom Line**: Your WeChat Mini Program code is correct! The errors you saw were just because you were testing it wrong. Use WeChat Developer Tools for all testing and development.

Your mini program is ready for proper testing! 🚀
