// payment.js
const app = getApp()

Page({
  data: {
    bookingInfo: {},
    selectedPayment: 'wechat', // 默认选择微信支付
    isProcessing: false,
    showPaymentModal: false
  },

  onLoad: function (options) {
    console.log('Payment page loaded', options)
    
    // 获取预订信息
    const bookingInfo = app.globalData.bookingInfo
    if (bookingInfo) {
      this.setData({
        bookingInfo: bookingInfo
      })
      console.log('Booking info loaded:', bookingInfo)
    } else {
      // 如果没有预订信息，返回首页
      wx.showModal({
        title: '提示',
        content: '预订信息获取失败，请重新预订',
        showCancel: false,
        success: () => {
          wx.reLaunch({
            url: '/pages/index/index'
          })
        }
      })
      return
    }
  },

  onShow: function () {
    console.log('Payment page show')
  },

  onReady: function () {
    console.log('Payment page ready')
  },

  onHide: function () {
    console.log('Payment page hide')
  },

  onUnload: function () {
    console.log('Payment page unload')
  },

  /**
   * 选择支付方式
   */
  selectPayment: function (e) {
    const method = e.currentTarget.dataset.method
    this.setData({
      selectedPayment: method
    })

    // 触觉反馈
    wx.vibrateShort({
      type: 'light'
    })

    console.log('Selected payment method:', method)
  },

  /**
   * 返回修改
   */
  goBack: function () {
    wx.navigateBack()
  },

  /**
   * 处理支付
   */
  processPayment: function () {
    if (this.data.isProcessing) {
      return
    }

    console.log('Processing WeChat Pay payment')

    // 显示支付处理状态
    this.setData({
      isProcessing: true,
      showPaymentModal: true
    })

    // 调用微信支付
    this.processWeChatPay()
  },

  /**
   * 微信支付处理
   */
  processWeChatPay: function () {
    console.log('Processing WeChat Pay...')
    
    // 准备订单数据
    const orderData = {
      court: this.data.bookingInfo.court.name,
      date: this.data.bookingInfo.dateLabel,
      time: this.data.bookingInfo.time,
      price: this.data.bookingInfo.price,
      timestamp: Date.now()
    }

    // TODO: 在生产环境中，需要先调用后端API创建订单并获取支付参数
    // 这里是示例代码结构：
    
    // Step 1: 调用后端创建订单
    // wx.request({
    //   url: 'https://your-backend-api.com/api/create-order',
    //   method: 'POST',
    //   data: orderData,
    //   success: (res) => {
    //     if (res.data.success) {
    //       // Step 2: 使用返回的支付参数调用微信支付
    //       this.callWeChatPayAPI(res.data.paymentParams)
    //     } else {
    //       this.onPaymentFail('订单创建失败')
    //     }
    //   },
    //   fail: (err) => {
    //     this.onPaymentFail('网络错误')
    //   }
    // })

    // 临时：模拟真实支付流程进行开发测试
    // 在实际部署前需要替换为真实的支付API调用
    this.simulateRealPayment()
  },

  /**
   * 调用微信支付API
   */
  callWeChatPayAPI: function(paymentParams) {
    wx.requestPayment({
      timeStamp: paymentParams.timeStamp,
      nonceStr: paymentParams.nonceStr,
      package: paymentParams.package,
      signType: paymentParams.signType || 'RSA',
      paySign: paymentParams.paySign,
      success: (res) => {
        console.log('WeChat Pay success:', res)
        this.onPaymentSuccess()
      },
      fail: (res) => {
        console.error('WeChat Pay failed:', res)
        if (res.errMsg === 'requestPayment:fail cancel') {
          this.onPaymentCancel()
        } else {
          this.onPaymentFail(res.errMsg || '支付失败')
        }
      },
      complete: () => {
        this.setData({
          showPaymentModal: false
        })
      }
    })
  },

  /**
   * 模拟真实支付流程（仅用于开发测试）
   */
  simulateRealPayment: function() {
    // 模拟网络请求延迟
    setTimeout(() => {
      // 模拟90%成功率
      const isSuccess = Math.random() > 0.1
      
      this.setData({
        showPaymentModal: false
      })

      if (isSuccess) {
        this.onPaymentSuccess()
      } else {
        this.onPaymentFail('支付失败，请重试')
      }
    }, 2000)
  },

  /**
   * 支付取消处理
   */
  onPaymentCancel: function() {
    this.setData({
      isProcessing: false,
      showPaymentModal: false
    })
    
    wx.showToast({
      title: '支付已取消',
      icon: 'none',
      duration: 2000
    })
  },

  /**
   * 支付成功处理
   */
  onPaymentSuccess: function () {
    console.log('Payment successful')

    // 生成预订ID
    const bookingId = 'PB' + Date.now().toString().slice(-6)
    
    // 保存支付信息到全局数据
    app.globalData.paymentInfo = {
      bookingId: bookingId,
      paymentMethod: 'wechat',
      amount: this.data.bookingInfo.price,
      paymentTime: new Date().toISOString(),
      status: 'success'
    }

    this.setData({
      isProcessing: false
    })

    // 跳转到成功页面
    wx.redirectTo({
      url: '/pages/success/success'
    })
  },

  /**
   * 支付失败处理
   */
  onPaymentFail: function (errorMsg) {
    console.log('Payment failed:', errorMsg)
    
    this.setData({
      isProcessing: false,
      showPaymentModal: false
    })

    wx.showModal({
      title: '支付失败',
      content: errorMsg || '支付过程中发生错误，请重试',
      showCancel: true,
      cancelText: '取消',
      confirmText: '重试',
      success: (res) => {
        if (res.confirm) {
          // 用户选择重试
          this.processPayment()
        }
      }
    })
  },

  /**
   * 分享功能
   */
  onShareAppMessage: function () {
    return {
      title: `预订 ${this.data.bookingInfo.court.name}`,
      desc: `¥${this.data.bookingInfo.price}/小时，立即预订！`,
      path: '/pages/index/index'
    }
  },

  /**
   * 用户点击右上角分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: `预订 ${this.data.bookingInfo.court.name}`,
      query: '',
      imageUrl: ''
    }
  }
})
