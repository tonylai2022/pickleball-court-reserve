// about.js
Page({
  data: {
    version: '1.0.0',
    contactPhone: '请联系球场前台'
  },

  onLoad: function (options) {
    console.log('About page loaded')
  },

  onShow: function () {
    wx.setNavigationBarTitle({
      title: '关于我们'
    })
  },

  showPrivacy: function () {
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    })
  },

  showTerms: function () {
    wx.navigateTo({
      url: '/pages/terms/terms'
    })
  },

  onShareAppMessage: function () {
    return {
      title: 'TRK匹克球场预订 - 专业球场在线预订',
      desc: '便捷预订，微信支付，实时确认',
      path: '/pages/index/index'
    }
  }
})
