// pages/record/record.js
const fn = require('../../utils/function.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tequanState: false,
    hintState:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      headerHeight: app.globalData.headerHeight,
      headerHeight2: app.globalData.headerHeight2,
      user_id: app.globalData.user_id
    })
    console.log(app.globalData.headerHeight)

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  
  // 获取记录
  getRecord(res) {
    var that = this;
    fn.http({
      param: { func: 'chat.getFollow', user_id: app.globalData.user_id },
      success: function (res) {
        var newData = res.data;
        var appData = that.unique(app.globalData.redData);
        that.setData({
          recordData: that.unique2(newData.concat(app.globalData.redData))
        })
        console.log(that.data.recordData);
        console.log(that.data.recordData.length)
      }
    })
  },
  unique2(arr) {
    var res = [arr[0]];
    for (var i = 1; i < arr.length; i++) {
      var repeat = false;
      for (var j = 0; j < res.length; j++) {
        if (arr[i]['from_user_id'] == res[j]['user_id']) {
          res[j] = arr[i]
          repeat = true;
          break;
        }
      }
      if (!repeat) {
        res.push(arr[i]);
      }
    }
    return res;
  },
  unique(arr) {
    var res = [arr[0]];
    for (var i = 1; i < arr.length; i++) {
      var repeat = false;
      for (var j = 0; j < res.length; j++) {
        if (arr[i]['from_user_id'] == res[j]['from_user_id']) {
          res[j] = arr[i]
          repeat = true;
          break;
        }
      }
      if (!repeat) {
        res.push(arr[i]);
      }
    }
    return res;
  },
  // 关注
  follow(res) {
    var that = this;
    fn.http({
      param: { func: 'user.follow', user_id: app.globalData.user_id, follow_user_id: res.currentTarget.dataset.uid },
      success: function (res) {
        if (res.code == "-100017") {
          that.setData({
            tequanState: true
          })
        } else {
          // 刷新纪录
          that.getRecord();
        }
      }
    })
  },
  // 取消关注
  unFollow(res) {
    var that = this;
    fn.http({
      param: { func: 'user.unfollow', user_id: app.globalData.user_id, unfollow_user_id: res.currentTarget.dataset.uid },
      success: function (res) {
        // 刷新纪录
        that.getRecord();
      }
    })
  },
  // 聊天
  toChat(res) {
    if (app.globalData.userState) {
      wx.showModal({
        title: '提示',
        content: "您被举报暂不能进行聊天",
        showCancel: false
      })
      return false
    }
    var that = this;
    var msglistData = res.currentTarget.dataset.itemdata;
    var msglist = {};
    msglist.user_id = msglistData.user_id;
    msglist.gender = msglistData.gender;
    msglist.name = msglistData.nickname;
    var abc = [];
    console.log(msglist)
    // that.readMessages(msglist);
    // var newData = app.globalData.redData.remove(msglist);
    for (var i = 0; i < app.globalData.redData.length;i++){
      // console.log(app.globalData.redData[i])
      if (app.globalData.redData[i]['from_user_id'] == msglist.from_user_id){
        
      }else{
        abc.push(app.globalData.redData[i])
      }
    }
    setTimeout(function(){
      app.globalData.redData=abc
    },500)
    app.globalData.chatData = msglist;
    wx.navigateTo({
      url: '../chat/chat',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  // 已读标识
  readMessages(res) {
    var that = this;
    fn.http({
      param: { func: "chat.read_message", user_id: app.globalData.user_id, from_user_id: res.user_id },
      success: function (res) {
        console.log("已读消息成功")
      }
    })
  },
  // 购买VIP
  payVip(res) {
    var that = this;
    fn.http({
      param: { func: 'pay.vip', user_id: app.globalData.user_id },
      success: function (res) {
        console.log(res)
        wx.requestPayment({
          appId: res.appId,
          timeStamp: String(res.timeStamp),
          nonceStr: res.nonceStr,
          package: res.package,
          signType: "MD5",
          paySign: res.paySign,
          success: function (res) {
            that.setData({
              tequanState: false
            })
            // 刷新纪录
            that.getRecord();
          },
          'fail': function (res) {
            console.log(res);
          }
        })
      }
    })
  },
  // 关闭弹窗
  closePop(res) {
    var that = this;
    that.setData({
      tequanState: false
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    that.getRecord();
    that.setData({
      isIos: app.globalData.isIos,
    })
  },
  // 取消添加桌面
  qxBtn(res) {
    var that = this;
    that.setData({
      hintState: false
    })
    app.globalData.mineHintState = false
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("页面卸载")
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    wx.stopPullDownRefresh();//停止页面刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: app.globalData.shareData.share_msg,
      path: '/pages/index/index?friend_u_id=' + app.globalData.user_id,
      imageUrl: app.globalData.shareData.share_img,
      success: function (res) { }
    }
    return false
  }
})