// pages/success/success.js

Page({
  data: {
    booking: null,
    currentTime: '',
    confirmationNumber: ''
  },

  onLoad: function(options) {
    console.log('Success page loaded with options:', options);
    
    // 生成确认号码
    const confirmationNumber = this.generateConfirmationNumber();
    
    // 从全局数据或页面参数获取预订信息
    const app = getApp();
    let booking = null;
    
    console.log('Global data check:', {
      bookingInfo: app.globalData.bookingInfo,
      paymentInfo: app.globalData.paymentInfo
    });
    
    if (app.globalData.bookingInfo && app.globalData.paymentInfo) {
      const bookingInfo = app.globalData.bookingInfo;
      const paymentInfo = app.globalData.paymentInfo;
      
      booking = {
        court: (bookingInfo.court && bookingInfo.court.name) || '标准场地A',
        date: bookingInfo.dateLabel || this.formatDate(new Date()),
        startTime: (bookingInfo.time && bookingInfo.time.split('-')[0]) || '09:00',
        endTime: (bookingInfo.time && bookingInfo.time.split('-')[1]) || '11:00',
        duration: bookingInfo.duration || 2,
        playerCount: bookingInfo.playerCount || 4,
        amount: paymentInfo.amount || 120,
        paymentMethod: this.getPaymentMethodName(paymentInfo.paymentMethod) || '微信支付',
        courtAddress: (bookingInfo.court && bookingInfo.court.address) || 'TRK·达鲁酷运动餐酒吧(友邦金融中心店)\n公平路209号友邦金融中心地下二层LG2层201号',
        courtPhone: (bookingInfo.court && bookingInfo.court.phone) || '400-123-4567'
      };
    } else {
      // 从参数解析预订信息或使用默认值
      booking = {
        court: options.court || '标准场地A',
        date: options.date || this.formatDate(new Date()),
        startTime: options.startTime || '09:00',
        endTime: options.endTime || '11:00',
        duration: parseInt(options.duration) || 2,
        playerCount: parseInt(options.playerCount) || 4,
        amount: parseFloat(options.amount) || 120,
        paymentMethod: options.paymentMethod || '微信支付',
        courtAddress: options.courtAddress || 'TRK·达鲁酷运动餐酒吧(友邦金融中心店)\n公平路209号友邦金融中心地下二层LG2层201号',
        courtPhone: options.courtPhone || '400-888-8888'
      };
    }

    console.log('Final booking data:', booking);

    this.setData({
      booking: booking,
      currentTime: this.formatDateTime(new Date()),
      confirmationNumber: confirmationNumber
    });

    console.log('Page data set:', {
      booking: this.data.booking,
      confirmationNumber: this.data.confirmationNumber
    });

    // 触发支付成功的触觉反馈
    wx.vibrateShort();

    // 播放成功音效（如果用户允许）
    this.playSuccessSound();
    
    // 清空全局数据
    if (app.globalData.bookingInfo) {
      app.globalData.bookingInfo = null;
    }
    if (app.globalData.paymentInfo) {
      app.globalData.paymentInfo = null;
    }
  },

  // 获取支付方式名称
  getPaymentMethodName: function (method) {
    const methodNames = {
      'wechat': '微信支付',
      'alipay': '支付宝',
      'card': '银行卡支付'
    }
    return methodNames[method] || '微信支付'
  },

  // 生成确认号码
  generateConfirmationNumber: function() {
    const prefix = 'PB';
    const timestamp = Date.now().toString().slice(-8);
    const random = ('000' + Math.floor(Math.random() * 1000)).slice(-3);
    return prefix + timestamp + random;
  },

  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return year + '-' + month + '-' + day;
  },

  // 格式化日期时间
  formatDateTime: function(date) {
    const dateStr = this.formatDate(date);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return dateStr + ' ' + hours + ':' + minutes;
  },

  // 播放成功音效
  playSuccessSound: function() {
    const innerAudioContext = wx.createInnerAudioContext();
    // 使用系统默认成功音效或自定义音效
    // innerAudioContext.src = '/assets/sounds/success.mp3';
    // innerAudioContext.play();
  },

  // 复制预订号码
  copyBookingId: function() {
    const confirmationNumber = this.data.confirmationNumber;
    
    wx.setClipboardData({
      data: confirmationNumber,
      success: function() {
        wx.showToast({
          title: '预订号已复制',
          icon: 'success',
          duration: 2000
        });
        
        // 触觉反馈
        wx.vibrateShort();
      },
      fail: function() {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 保存到相册
  saveToAlbum: function() {
    wx.showLoading({
      title: '生成中...',
    });

    // 模拟生成预订凭证图片
    setTimeout(function() {
      wx.hideLoading();
      
      // 实际项目中，这里应该生成包含预订信息的图片
      wx.showModal({
        title: '保存成功',
        content: '预订凭证已保存到相册，可在微信聊天中分享使用',
        confirmText: '知道了',
        showCancel: false
      });
    }, 1500);
  },

  // 添加到日历
  addToCalendar: function() {
    const booking = this.data.booking;
    
    // 构造日历事件信息
    const eventTitle = '网球场预订 - ' + booking.court;
    const eventDate = booking.date;
    const startTime = booking.startTime;
    const endTime = booking.endTime;
    
    wx.showModal({
      title: '添加日历提醒',
      content: '将在 ' + eventDate + ' ' + startTime + '-' + endTime + ' 创建日历事件：' + eventTitle,
      confirmText: '添加',
      cancelText: '取消',
      success: function(res) {
        if (res.confirm) {
          // 实际项目中，这里应该调用系统日历API
          wx.showToast({
            title: '已添加到日历',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  // 打开地图导航
  openMap: function() {
    const booking = this.data.booking;
    
    // 友邦金融中心的大致坐标（实际项目中应该从数据库获取精确坐标）
    const latitude = 39.915119;
    const longitude = 116.403963;
    
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: booking.court,
      address: booking.courtAddress,
      scale: 18,
      fail: function() {
        wx.showToast({
          title: '无法打开地图',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 拨打场地电话
  makePhoneCall: function() {
    const booking = this.data.booking;
    
    wx.makePhoneCall({
      phoneNumber: booking.courtPhone,
      fail: function() {
        wx.showToast({
          title: '无法拨打电话',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 分享预订信息
  shareBooking: function() {
    const booking = this.data.booking;
    const confirmationNumber = this.data.confirmationNumber;
    
    // 复制到剪贴板进行分享
    wx.setClipboardData({
      data: '🏸 匹克球场预订成功！\n\n📋 预订编号: ' + confirmationNumber + '\n🏟️ 球场名称: ' + booking.court + '\n📅 预订日期: ' + booking.date + '\n⏰ 预订时间: ' + booking.startTime + '-' + booking.endTime + '\n👥 参与人数: ' + booking.playerCount + '人\n💰 支付金额: ¥' + booking.amount + '\n💳 支付方式: ' + booking.paymentMethod + '\n\n📍 场地地址: ' + booking.courtAddress + '\n📞 联系电话: ' + booking.courtPhone + '\n\n期待您的光临！',
      success: function() {
        wx.showToast({
          title: '预订信息已复制',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  // 联系客服
  contactService: function() {
    wx.showActionSheet({
      itemList: ['在线客服', '客服热线', '意见反馈'],
      success: function(res) {
        switch(res.tapIndex) {
          case 0:
            // 在线客服
            wx.showToast({
              title: '正在连接客服...',
              icon: 'loading',
              duration: 2000
            });
            break;
          case 1:
            // 客服热线
            wx.makePhoneCall({
              phoneNumber: '400-123-4567'
            });
            break;
          case 2:
            // 意见反馈
            wx.showModal({
              title: '意见反馈',
              content: '感谢您的反馈，我们会持续改进服务质量',
              showCancel: false
            });
            break;
        }
      }
    });
  },

  // 返回首页
  goHome: function() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  // 再次预订
  bookAgain: function() {
    wx.redirectTo({
      url: '/pages/booking/booking'
    });
  },

  // 查看我的预订
  viewMyBookings: function() {
    wx.showToast({
      title: '我的预订功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  // 页面分享配置
  onShareAppMessage: function() {
    const booking = this.data.booking;
    
    return {
      title: '我在' + booking.court + '预订了网球场',
      path: '/pages/index/index'
    };
  },

  // 页面分享到朋友圈配置
  onShareTimeline: function() {
    const booking = this.data.booking;
    
    return {
      title: '网球场预订成功 - ' + booking.court
    };
  }
});
