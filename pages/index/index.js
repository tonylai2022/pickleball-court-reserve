// index.js
const app = getApp()

Page({
  data: {
    courtInfo: {
      name: 'Urban Dinker Court',
      price: 120,
      description: '专业级匹克球场，配备优质地面和专业照明设备。位置便利，停车方便。',
      features: [
        { icon: '🏸', text: '专业球拍' },
        { icon: '💡', text: 'LED照明' },
        { icon: '🅿️', text: '免费停车' }
      ],
      businessHours: '08:00 - 22:00',
      phone: '400-888-8888',
      address: 'TRK·达鲁酷运动餐酒吧(友邦金融中心店)\n公平路209号友邦金融中心地下二层LG2层201号'
    },
    userInfo: null
  },

  onLoad: function (options) {
    console.log('Index page loaded', options)
    
    // 检查用户是否已授权
    this.checkUserAuthorization()
  },

  onShow: function () {
    console.log('Index page show')
    
    // 每次显示页面时刷新数据
    this.refreshData()
  },

  onReady: function () {
    console.log('Index page ready')
  },

  onHide: function () {
    console.log('Index page hide')
  },

  onUnload: function () {
    console.log('Index page unload')
  },

  /**
   * 打开预订页面
   */
  openBooking: function () {
    console.log('Opening booking page')
    
    // 保存球场信息到全局数据
    app.globalData.selectedCourt = this.data.courtInfo
    
    // 跳转到预订页面
    wx.navigateTo({
      url: '/pages/booking/booking'
    })
  },

  /**
   * 显示关于页面
   */
  showAbout: function () {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  /**
   * 显示服务条款
   */
  showTerms: function () {
    wx.navigateTo({
      url: '/pages/terms/terms'
    })
  },

  /**
   * 显示隐私政策
   */
  showPrivacy: function () {
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    })
  },

  /**
   * 检查用户授权状态
   */
  checkUserAuthorization: function () {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: (res) => {
              this.setData({
                userInfo: res.userInfo
              })
              app.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })
  },

  /**
   * 刷新页面数据
   */
  refreshData: function () {
    // 这里可以调用API刷新球场信息、可用时间等
    console.log('Refreshing data...')
  },

  /**
   * 分享功能
   */
  onShareAppMessage: function () {
    return {
      title: 'TRK匹克球场预订 - Urban Dinker Court',
      desc: '专业级匹克球场，立即预订享受优质服务！',
      path: '/pages/index/index'
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: 'TRK匹克球场预订 - Urban Dinker Court',
      query: '',
      imageUrl: '/images/court.jpeg'
    }
  },

  /**
   * 联系客服
   */
  contactService: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.courtInfo.phone,
      success: () => {
        console.log('Phone call success')
      },
      fail: () => {
        wx.showToast({
          title: '拨打电话失败',
          icon: 'error'
        })
      }
    })
  },

  /**
   * 查看地址
   */
  viewLocation: function () {
    // 这里可以集成地图功能
    wx.showModal({
      title: '球场地址',
      content: this.data.courtInfo.address,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    console.log('Pull down refresh')
    
    this.refreshData()
    
    // 停止下拉刷新
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
})
