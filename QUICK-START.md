# Quick Start - Local Testing

## 🚀 Instant Local Testing

### Method 1: WeChat Developer Tools (Recommended)

1. **Download WeChat DevTools**: 
   - Go to: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
   - Download "Stable Version" for Windows

2. **Import Project**:
   - Open WeChat Developer Tools
   - Click "Import Project" 
   - Browse to: `c:\Users\sp990\Desktop\pickleball_court_reserve`
   - App ID: `wxtest123456789` (test ID)
   - Project Name: `Pickleball Court Reservation`
   - Click "Import"

3. **Start Testing**:
   - Click "Compile" button
   - Use simulator to test on different devices
   - Click "Preview" to test on real phone

### Method 2: Browser Testing (Limited Features)

Since this is a WeChat Mini Program, browser testing is limited, but you can:

1. Open the original web version: `index.html` 
2. Test basic functionality
3. Note: WeChat-specific features won't work

## ✅ Quick Test Checklist

### 🏠 **Home Page Test** (2 minutes)
- [ ] Page loads without errors
- [ ] Court image displays
- [ ] Court info shows correctly (¥120/hour)
- [ ] "立即预订" button is clickable

### 📅 **Booking Page Test** (3 minutes)
- [ ] Date selection works (今天/明天/后天)
- [ ] Time slots display properly
- [ ] Available slots are selectable (green)
- [ ] Unavailable slots are disabled (gray)
- [ ] Booking summary appears after selection

### 💳 **Payment Page Test** (2 minutes)  
- [ ] Payment methods display (WeChat/Alipay/Card)
- [ ] Selection highlights properly
- [ ] "确认支付" button enables after selection
- [ ] Payment processing shows loading state

### ✅ **Success Page Test** (1 minute)
- [ ] Booking details display correctly
- [ ] Booking ID is generated
- [ ] Action buttons work (share/contact/home)

## 🔧 Testing Commands

Open Console in WeChat Developer Tools and run:

```javascript
// Load test suite
const test = require('./test.js')

// Run all tests
test.runAllTests()

// Or run individual tests
test.testAppInit()
test.testDataFlow()
test.testUIInteractions()
```

## 🐛 Common Issues & Quick Fixes

### Issue: "Page not found"
**Fix**: Check `app.json` - all page paths must exist

### Issue: Images not loading  
**Fix**: Images use external URLs (Unsplash) - check internet connection

### Issue: Styles not applying
**Fix**: WeChat uses `.wxss` files, not `.css` - check file extensions

### Issue: JavaScript errors
**Fix**: Use WeChat Mini Program APIs, not browser APIs

## 📱 Device Testing

Test on different screen sizes in simulator:
- **iPhone 6/7/8**: 375x667
- **iPhone X**: 375x812  
- **Android**: Various sizes
- **iPad**: Tablet view

## 🎯 Test Scenarios

### Happy Path (5 minutes)
1. Open home page
2. Click court → Select tomorrow → Pick 10:00-11:00
3. Choose WeChat Pay → Confirm payment
4. View success page with booking details

### Error Handling (3 minutes)
1. Try selecting unavailable time slot
2. Try payment without selecting method
3. Test back navigation
4. Try rapid clicking

## 📊 Performance Check

Monitor in DevTools:
- **Load Time**: < 2 seconds per page
- **Memory**: No significant leaks
- **Network**: Images load properly
- **Console**: No JavaScript errors

## ✨ Features to Verify

### Core Functionality
- [x] Complete booking flow
- [x] Payment simulation  
- [x] Data persistence between pages
- [x] Chinese language display

### WeChat Features
- [x] Page navigation
- [x] Touch interactions
- [x] Loading states
- [x] Error messages
- [x] Share functionality (simulated)

### Mobile UX
- [x] Responsive design
- [x] Touch-friendly buttons
- [x] Smooth animations
- [x] Proper spacing

## 🚀 Ready for Real Testing?

Once local testing passes:

1. **Get Real App ID**: Register at mp.weixin.qq.com
2. **Replace Test ID**: Update `appid` in config
3. **Add Real APIs**: Connect to your backend
4. **Device Testing**: Test on actual WeChat
5. **Submit Review**: WeChat approval process

---
**Total Testing Time**: ~15 minutes for complete verification!
