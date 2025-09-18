// privacy.js
Page({
  data: {
    updateDate: '2025年9月18日',
    contactPhone: '请联系球场前台'
  },

  onLoad: function (options) {
    console.log('Privacy page loaded')
  },

  onShow: function () {
    wx.setNavigationBarTitle({
      title: '隐私政策'
    })
  },

  goBack: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  onShareAppMessage: function () {
    return {
      title: 'TRK匹克球场预订 - 隐私政策',
      path: '/pages/privacy/privacy'
    }
  }
})
