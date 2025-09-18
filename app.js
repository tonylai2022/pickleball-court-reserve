App({
  globalData: {
    userInfo: null,
    selectedCourt: null,
    bookingInfo: {
      date: '',
      time: '',
      price: 120,
      paymentMethod: ''
    }
  },

  onLaunch: function (options) {
    console.log('App Launch', options)
    
    // 获取系统信息
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res
      }
    })

    // 检查微信版本
    const version = wx.getSystemInfoSync().SDKVersion
    if (this.compareVersion(version, '2.10.0') >= 0) {
      console.log('WeChat version supports latest features')
    }
  },

  onShow: function (options) {
    console.log('App Show', options)
  },

  onHide: function () {
    console.log('App Hide')
  },

  onError: function (msg) {
    console.error('App Error', msg)
  },

  // 工具函数：版本比较
  compareVersion: function (v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
      v1.push('0')
    }
    while (v2.length < len) {
      v2.push('0')
    }

    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i])
      const num2 = parseInt(v2[i])

      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }

    return 0
  },

  // 工具函数：格式化时间
  formatTime: function (date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return `${[year, month, day].map(this.formatNumber).join('-')} ${[hour, minute, second].map(this.formatNumber).join(':')}`
  },

  formatNumber: function (n) {
    n = n.toString()
    return n[1] ? n : `0${n}`
  },

  // 工具函数：显示提示
  showToast: function (title, icon = 'success', duration = 2000) {
    wx.showToast({
      title: title,
      icon: icon,
      duration: duration
    })
  },

  // 工具函数：显示加载
  showLoading: function (title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    })
  },

  hideLoading: function () {
    wx.hideLoading()
  }
})
