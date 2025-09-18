// Test runner for local development
// Run this in WeChat Developer Tools Console

console.log('🏓 Starting Pickleball Court Reservation Test Suite...')

// Test 1: App initialization
function testAppInit() {
  console.log('📱 Testing App Initialization...')
  const app = getApp()
  console.log('✅ App loaded:', !!app)
  console.log('✅ Global data initialized:', !!app.globalData)
  console.log('✅ Court info structure:', app.globalData.selectedCourt ? 'Ready' : 'Empty')
}

// Test 2: Page navigation
function testNavigation() {
  console.log('🧭 Testing Page Navigation...')
  
  // Test navigation to booking page
  wx.navigateTo({
    url: '/pages/booking/booking',
    success: () => console.log('✅ Navigation to booking page successful'),
    fail: (err) => console.error('❌ Navigation failed:', err)
  })
  
  setTimeout(() => {
    wx.navigateBack({
      success: () => console.log('✅ Navigate back successful'),
      fail: (err) => console.error('❌ Navigate back failed:', err)
    })
  }, 1000)
}

// Test 3: Data flow
function testDataFlow() {
  console.log('📊 Testing Data Flow...')
  
  const app = getApp()
  
  // Test court data
  const testCourt = {
    name: 'Test Urban Dinker Court',
    price: 120,
    description: 'Test description'
  }
  
  app.globalData.selectedCourt = testCourt
  console.log('✅ Court data set:', app.globalData.selectedCourt.name)
  
  // Test booking data
  const testBooking = {
    date: 'today',
    time: '09:00-10:00',
    price: 120
  }
  
  app.globalData.bookingInfo = testBooking
  console.log('✅ Booking data set:', app.globalData.bookingInfo.time)
}

// Test 4: WeChat APIs
function testWeChatAPIs() {
  console.log('🔗 Testing WeChat APIs...')
  
  // Test system info
  wx.getSystemInfo({
    success: (res) => {
      console.log('✅ System info:', res.platform, res.version)
      console.log('✅ Screen size:', res.windowWidth + 'x' + res.windowHeight)
    },
    fail: (err) => console.error('❌ System info failed:', err)
  })
  
  // Test storage
  wx.setStorage({
    key: 'test',
    data: 'test-value',
    success: () => {
      console.log('✅ Storage set successful')
      wx.getStorage({
        key: 'test',
        success: (res) => console.log('✅ Storage get successful:', res.data),
        fail: (err) => console.error('❌ Storage get failed:', err)
      })
    },
    fail: (err) => console.error('❌ Storage set failed:', err)
  })
}

// Test 5: UI interactions
function testUIInteractions() {
  console.log('🎨 Testing UI Interactions...')
  
  // Test toast
  wx.showToast({
    title: '测试提示',
    icon: 'success',
    duration: 1000,
    success: () => console.log('✅ Toast displayed successfully')
  })
  
  setTimeout(() => {
    // Test modal
    wx.showModal({
      title: '测试弹窗',
      content: '这是一个测试弹窗',
      showCancel: false,
      success: (res) => {
        if (res.confirm) {
          console.log('✅ Modal interaction successful')
        }
      }
    })
  }, 1500)
}

// Test 6: Payment simulation
function testPaymentFlow() {
  console.log('💳 Testing Payment Simulation...')
  
  const app = getApp()
  
  // Set up test data
  app.globalData.selectedCourt = {
    name: 'Urban Dinker Court',
    price: 120
  }
  
  app.globalData.bookingInfo = {
    court: app.globalData.selectedCourt,
    date: 'today',
    dateLabel: '今天',
    time: '10:00-11:00',
    price: 120
  }
  
  console.log('✅ Payment test data prepared')
  
  // Simulate payment processing
  setTimeout(() => {
    const bookingId = 'PB' + Date.now().toString().slice(-6)
    app.globalData.paymentInfo = {
      bookingId: bookingId,
      paymentMethod: 'wechat',
      amount: 120,
      status: 'success'
    }
    
    console.log('✅ Payment simulation completed:', bookingId)
  }, 1000)
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running Complete Test Suite...')
  console.log('═══════════════════════════════')
  
  testAppInit()
  console.log('───────────────────────────────')
  
  setTimeout(() => {
    testDataFlow()
    console.log('───────────────────────────────')
  }, 500)
  
  setTimeout(() => {
    testWeChatAPIs()
    console.log('───────────────────────────────')
  }, 1000)
  
  setTimeout(() => {
    testUIInteractions()
    console.log('───────────────────────────────')
  }, 2000)
  
  setTimeout(() => {
    testPaymentFlow()
    console.log('───────────────────────────────')
  }, 3000)
  
  setTimeout(() => {
    console.log('🎉 All tests completed!')
    console.log('═══════════════════════════════')
  }, 4000)
}

// Export test functions
module.exports = {
  runAllTests,
  testAppInit,
  testNavigation,
  testDataFlow,
  testWeChatAPIs,
  testUIInteractions,
  testPaymentFlow
}
