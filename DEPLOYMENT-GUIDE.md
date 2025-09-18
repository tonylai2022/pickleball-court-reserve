# WeChat Mini Program Deployment Guide

## 📱 Making Your Mini Program Sharable for Phone Testing

### Method 1: Upload Version for Testing (Recommended)

#### Step 1: Upload to WeChat Developer Tools
1. Open WeChat Developer Tools
2. Make sure your project is loaded and working locally
3. Click the **"Upload"** (上传) button in the top toolbar
4. Fill in version information:
   - Version: `1.0.0` (or any version number)
   - Description: `Initial test version for court reservation system`
5. Click **"Upload"** to submit

#### Step 2: Submit for Review via WeChat MP Admin
1. Go to [WeChat Mini Program Admin Panel](https://mp.weixin.qq.com)
2. Login with your WeChat Mini Program account
3. Go to **"Development" → "Development Management" → "Version Management"**
4. Find your uploaded version and click **"Submit for Review"**
5. Fill out the review form:
   - **Category**: Sports & Fitness → Court Booking
   - **Core Functions**: Court reservation and payment
   - **Test Account**: Provide test credentials if needed

#### Step 3: Get Test QR Code
1. After submission, you'll get a **Test QR Code**
2. Share this QR code with testers
3. They can scan with WeChat to test on their phones

---

### Method 2: Preview QR Code (Quick Testing)

#### Generate Preview QR Code
1. In WeChat Developer Tools, click **"Preview"** (预览)
2. A QR code will appear
3. **Limitations**:
   - QR code expires in ~30 minutes
   - Only works for the developer's WeChat account
   - Not suitable for sharing with others

---

### Method 3: Experience Version (Best for Team Testing)

#### Step 1: Set Up Experience Version
1. In WeChat MP Admin Panel: **"Development" → "Development Management"**
2. Set your uploaded version as **"Experience Version"**
3. This creates a stable test environment

#### Step 2: Add Test Users
1. Go to **"Users and Permissions" → "Experience Members"**
2. Add WeChat IDs of people who should test
3. They'll receive invitation notifications

#### Step 3: Generate Experience QR Code
1. In **"Development Management"**, find the Experience Version
2. Click **"Experience QR Code"** to generate
3. Share this QR code with your test team

---

## 🔧 Current Project Configuration

- **App ID**: `wx3ab26b68d1115d4e`
- **Project Name**: `pickleball-court-reserve`
- **Version**: Ready for upload

## 📋 Pre-Upload Checklist

- ✅ All pages working locally
- ✅ Navigation flows complete
- ✅ Payment simulation working
- ✅ Images loading properly
- ✅ Address updated to TRK location
- ✅ Button functions fixed

## 🚀 Quick Deploy Commands

### Upload from WeChat Developer Tools:
1. Open WeChat Developer Tools
2. Load project from: `C:\Users\sp990\Desktop\pickleball_court_reserve`
3. Click **"Upload"** button
4. Enter version info and submit

### Alternative: Command Line Upload (if available):
```bash
# If WeChat CLI tools are installed
wechat-devtools --upload --project-path "C:\Users\sp990\Desktop\pickleball_court_reserve"
```

## 📱 Testing on Phone

### For Developers:
1. Use **Preview QR Code** for quick testing
2. Scan with your own WeChat

### For Team/Users:
1. Upload version to WeChat MP Admin
2. Set as **Experience Version**
3. Add test users
4. Share **Experience QR Code**

### For Public:
1. Submit for WeChat review
2. After approval, get official QR code
3. Users can search mini program name in WeChat

## 🔍 Testing Features to Verify:

- [ ] Court image displays correctly
- [ ] Address shows TRK location
- [ ] Booking flow works end-to-end
- [ ] Payment simulation completes
- [ ] Success page shows correctly
- [ ] All buttons function properly
- [ ] Navigation works between pages
- [ ] Share functionality works
- [ ] Phone call/map features work on real device

## 📞 Support

If you encounter issues:
1. Check WeChat Developer Tools console for errors
2. Verify all required mini program configurations
3. Ensure compliance with WeChat Mini Program guidelines
4. Contact WeChat Mini Program support if needed

## 🎯 Next Steps

1. **Test locally** one more time to ensure everything works
2. **Upload** first version via WeChat Developer Tools
3. **Set up Experience Version** for team testing
4. **Add test users** and share QR code
5. **Collect feedback** and iterate
6. **Submit for review** when ready for public release
