# 🚀 WeChat Mini Program Testing Instructions

## For Testers - How to Test the App

### 📱 Method 1: Phone Testing (Easiest!)
1. **Ask the developer** to generate a QR code in WeChat Developer Tools
2. **Open WeChat app** on your phone  
3. **Scan the QR code** (use WeChat's built-in scanner)
4. **Test directly on your phone!**

### 💻 Method 2: Computer Testing
1. **Download WeChat Developer Tools** from: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. **Install and login** with your WeChat account
3. **Import the project**:
   - App ID: `wx3ab26b68d1115d4e`
   - Select the project folder you received
   - Project Name: `Pickleball Court Reservation`
4. **Test in the simulator** (left panel)

## 🎯 What to Test

### ✅ Core Functionality:
- [ ] **Home page** displays TRK restaurant info and court image
- [ ] **Booking page** allows date/time selection  
- [ ] **Payment page** shows WeChat Pay, Alipay, Bank Card options
- [ ] **Success page** displays booking confirmation with voucher
- [ ] **Navigation** works between all pages
- [ ] **Back buttons** function correctly

### 📱 Mobile-Specific:
- [ ] **Touch interactions** are responsive
- [ ] **Scrolling** works smoothly
- [ ] **Text is readable** on phone screen
- [ ] **Buttons are easy to tap**
- [ ] **Forms are usable** on mobile

### 🏓 Business Logic:
- [ ] **Court availability** updates correctly
- [ ] **Booking times** can be selected
- [ ] **Payment flow** completes successfully  
- [ ] **Booking confirmation** contains all details
- [ ] **Contact info** for TRK restaurant is displayed

## 📝 Feedback Template

When testing, please note:

**Device Used**: (iPhone/Android/Simulator)
**Screen Size**: (if known)

**Works Well**:
- List things that work perfectly

**Issues Found**:
- Describe any problems or bugs
- Include screenshots if possible

**Suggestions**:
- Ideas for improvements
- Features you'd like to see

## 💡 Common Questions

**Q: Can I book a real court?**
A: This is a prototype/demo. Payments are simulated, not real.

**Q: Why does it say "TRK restaurant"?**  
A: This was customized for TRK·达鲁酷运动餐酒吧 as the venue.

**Q: Can I share this with others?**
A: Yes! Share the QR code for easy phone testing.

**Q: The app looks different on my phone vs computer**
A: Normal! It's responsive design - adapts to different screens.

## 🆘 Having Issues?

**"App is not defined" errors**: You're not using WeChat Developer Tools. Use the QR code method instead!

**Can't import project**: Double-check the App ID is exactly `wx3ab26b68d1115d4e`

**QR code expired**: Ask developer to generate a fresh one

**App won't load**: Make sure you have latest WeChat app version

---

**🎉 Thanks for testing! Your feedback helps improve the app.**
