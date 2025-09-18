// booking.js
const app = getApp()

Page({
  data: {
    courtInfo: {},
    selectedDate: 'today',
    selectedDateLabel: '今天',
    selectedTimeSlot: '',
    dateOptions: [],
    timeSlots: [],
    // 模拟时间段数据
    timeSlotsData: {
      today: [
        { time: '08:00-09:00', available: false },
        { time: '09:00-10:00', available: true },
        { time: '10:00-11:00', available: true },
        { time: '11:00-12:00', available: false },
        { time: '12:00-13:00', available: true },
        { time: '13:00-14:00', available: true },
        { time: '14:00-15:00', available: false },
        { time: '15:00-16:00', available: true },
        { time: '16:00-17:00', available: true },
        { time: '17:00-18:00', available: true },
        { time: '18:00-19:00', available: false },
        { time: '19:00-20:00', available: true },
        { time: '20:00-21:00', available: true },
        { time: '21:00-22:00', available: false }
      ],
      tomorrow: [
        { time: '08:00-09:00', available: true },
        { time: '09:00-10:00', available: true },
        { time: '10:00-11:00', available: false },
        { time: '11:00-12:00', available: true },
        { time: '12:00-13:00', available: true },
        { time: '13:00-14:00', available: false },
        { time: '14:00-15:00', available: true },
        { time: '15:00-16:00', available: true },
        { time: '16:00-17:00', available: false },
        { time: '17:00-18:00', available: true },
        { time: '18:00-19:00', available: true },
        { time: '19:00-20:00', available: true },
        { time: '20:00-21:00', available: false },
        { time: '21:00-22:00', available: true }
      ],
      'day-after': [
        { time: '08:00-09:00', available: true },
        { time: '09:00-10:00', available: false },
        { time: '10:00-11:00', available: true },
        { time: '11:00-12:00', available: true },
        { time: '12:00-13:00', available: false },
        { time: '13:00-14:00', available: true },
        { time: '14:00-15:00', available: true },
        { time: '15:00-16:00', available: true },
        { time: '16:00-17:00', available: true },
        { time: '17:00-18:00', available: false },
        { time: '18:00-19:00', available: true },
        { time: '19:00-20:00', available: false },
        { time: '20:00-21:00', available: true },
        { time: '21:00-22:00', available: true }
      ]
    }
  },

  onLoad: function (options) {
    console.log('Booking page loaded', options)
    
    // 获取球场信息
    const courtInfo = app.globalData.selectedCourt
    if (courtInfo) {
      this.setData({
        courtInfo: courtInfo
      })
    } else {
      // 如果没有球场信息，返回首页
      wx.showModal({
        title: '提示',
        content: '球场信息获取失败，请重新选择',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
      return
    }

    // 初始化日期选项
    this.initDateOptions()
    
    // 初始化时间段
    this.updateTimeSlots()
  },

  onShow: function () {
    console.log('Booking page show')
  },

  onReady: function () {
    console.log('Booking page ready')
  },

  onHide: function () {
    console.log('Booking page hide')
  },

  onUnload: function () {
    console.log('Booking page unload')
  },

  /**
   * 初始化日期选项
   */
  initDateOptions: function () {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(today.getDate() + 2)

    const dateOptions = [
      {
        label: '今天',
        value: 'today',
        date: this.formatDate(today)
      },
      {
        label: '明天',
        value: 'tomorrow',
        date: this.formatDate(tomorrow)
      },
      {
        label: '后天',
        value: 'day-after',
        date: this.formatDate(dayAfter)
      }
    ]

    this.setData({
      dateOptions: dateOptions
    })
  },

  /**
   * 格式化日期
   */
  formatDate: function (date) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekDay = weekDays[date.getDay()]
    
    return `${month}月${day}日 ${weekDay}`
  },

  /**
   * 选择日期
   */
  selectDate: function (e) {
    const date = e.currentTarget.dataset.date
    const dateOption = this.data.dateOptions.find(item => item.value === date)
    
    this.setData({
      selectedDate: date,
      selectedDateLabel: dateOption ? dateOption.label : '今天',
      selectedTimeSlot: '' // 重置时间选择
    })

    // 更新时间段
    this.updateTimeSlots()
  },

  /**
   * 更新时间段
   */
  updateTimeSlots: function () {
    const slots = this.data.timeSlotsData[this.data.selectedDate] || []
    this.setData({
      timeSlots: slots
    })
  },

  /**
   * 选择时间段
   */
  selectTimeSlot: function (e) {
    const time = e.currentTarget.dataset.time
    const available = e.currentTarget.dataset.available

    if (!available) {
      app.showToast('该时段已被预订', 'error')
      return
    }

    this.setData({
      selectedTimeSlot: time
    })

    // 触觉反馈
    wx.vibrateShort({
      type: 'light'
    })
  },

  /**
   * 返回上一页
   */
  goBack: function () {
    wx.navigateBack()
  },

  /**
   * 进入支付页面
   */
  proceedToPayment: function () {
    if (!this.data.selectedTimeSlot) {
      app.showToast('请选择时间段', 'error')
      return
    }

    // 保存预订信息到全局数据
    app.globalData.bookingInfo = {
      court: this.data.courtInfo,
      date: this.data.selectedDate,
      dateLabel: this.data.selectedDateLabel,
      time: this.data.selectedTimeSlot,
      price: this.data.courtInfo.price
    }

    console.log('Booking info:', app.globalData.bookingInfo)

    // 跳转到支付页面
    wx.navigateTo({
      url: '/pages/payment/payment'
    })
  },

  /**
   * 分享功能
   */
  onShareAppMessage: function () {
    return {
      title: `预订 ${this.data.courtInfo.name}`,
      desc: `¥${this.data.courtInfo.price}/小时，立即预订！`,
      path: '/pages/index/index'
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    console.log('Pull down refresh')
    
    // 刷新时间段数据
    this.updateTimeSlots()
    
    // 停止下拉刷新
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
})
