# Local Testing Guide for WeChat Mini Program

## 🧪 Testing Your Pickleball Court Reservation Mini Program

### Step 1: Download WeChat Developer Tools

1. Go to https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. Download the **Stable Version** for Windows
3. Install the WeChat Developer Tools

### Step 2: Create Test App ID

For local testing, you can use a test App ID:
- **Test App ID**: `wxtest123456789` (for development only)
- Or register for a real App ID at: https://mp.weixin.qq.com

### Step 3: Import Project

1. Open WeChat Developer Tools
2. Click "Import Project"
3. Select project directory: `c:\Users\sp990\Desktop\pickleball_court_reserve`
4. Enter App ID: `wxtest123456` (or your registered App ID)
5. Project Name: "Pickleball Court Reservation"
6. Click "Import"

### Step 4: Test Features

#### ✅ **Navigation Flow**
- [x] Home page loads correctly
- [x] Court card displays with image and info
- [x] Clicking court opens booking page
- [x] Date selection works (Today, Tomorrow, Day After)
- [x] Time slot selection shows availability
- [x] Booking summary appears
- [x] Payment page shows payment options
- [x] Success page displays booking details

#### ✅ **Interactive Features**
- [x] Touch interactions work smoothly
- [x] Modal dialogs open/close properly
- [x] Form validation prevents invalid submissions
- [x] Loading states show during processing
- [x] Error messages display correctly

#### ✅ **WeChat-Specific Features**
- [x] Page navigation with back buttons
- [x] Pull-to-refresh on booking page
- [x] Share functionality (simulated)
- [x] Haptic feedback on interactions
- [x] Responsive design on different screen sizes

### Step 5: Debugging

Use the built-in debugger:
1. Open Console tab in WeChat Developer Tools
2. Check for any JavaScript errors
3. Monitor network requests
4. Test on different device simulators

### Step 6: Device Testing

Test on real device:
1. Click "Preview" in WeChat Developer Tools
2. Scan QR code with WeChat on your phone
3. Test all features on actual mobile device

## 🔧 Common Testing Issues & Solutions

### Issue: Images not loading
**Solution**: Check image URLs are accessible or add placeholder images

### Issue: Payment simulation too fast
**Solution**: Adjust timeout in `payment.js` line 150

### Issue: Navigation errors
**Solution**: Verify all page paths in `app.json` are correct

### Issue: Styles not applying
**Solution**: Check for typos in class names and CSS syntax

## 📱 Test Scenarios

### Scenario 1: Happy Path
1. Open mini program
2. Click on court
3. Select tomorrow
4. Choose available time slot
5. Select WeChat Pay
6. Complete payment
7. View success page

### Scenario 2: Error Handling
1. Try to select unavailable time slot
2. Attempt payment without selecting method
3. Test back button navigation
4. Try sharing functionality

### Scenario 3: Edge Cases
1. Test on different screen sizes
2. Test with poor network connection
3. Test rapid clicking/tapping
4. Test page refresh scenarios

## 📊 Performance Testing

Monitor these metrics in WeChat Developer Tools:
- **Page Load Time**: Should be < 2 seconds
- **Memory Usage**: Monitor for memory leaks
- **Network Requests**: Minimize unnecessary requests
- **Animation Performance**: Smooth 60fps animations

## 🐛 Debugging Tips

1. **Console Logs**: Check all console.log statements work
2. **Network Tab**: Monitor API calls (currently simulated)
3. **Storage Tab**: Check global data persistence
4. **Performance Tab**: Monitor page performance

## ✅ Pre-Launch Checklist

- [ ] All pages load without errors
- [ ] Navigation works in all directions
- [ ] Payment flow completes successfully
- [ ] Booking information persists correctly
- [ ] Share functionality works
- [ ] Error messages are user-friendly
- [ ] Design looks good on different screen sizes
- [ ] Chinese text displays correctly
- [ ] Loading states provide good UX

## 🚀 Ready for Production?

Once local testing passes:
1. Register official WeChat Mini Program account
2. Configure real payment APIs
3. Set up backend services
4. Submit for WeChat review
5. Launch to users!

---

**Note**: This is a simulation environment. Real WeChat Pay, user authentication, and some native features will only work after official registration and review approval.
