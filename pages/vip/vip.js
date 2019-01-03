// pages/vip/vip.js
const fn = require('../../utils/function.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 支付
  apply: function (res) {
    var that = this;
    if (that.data.applyNum < app.globalData.applyFew) {
      var content = '最少购买' + app.globalData.applyFew + '个'
      wx.showModal({
        title: '提示',
        content: content,
      })
    } else {
      fn.http({
        param: {
          func: "user.placeOrder",
          user_id: app.globalData.user_id,
          total_fee: 19,
          body: "充值会员",
          o_type: 1
        },
        success: function (res) {
          console.log(res);
          console.log(res.sign)
          wx.requestPayment({
            appId: res.appId,
            timeStamp: String(res.timeStamp),
            nonceStr: res.nonceStr,
            package: res.package,
            signType: "MD5",
            paySign: res.paySign,
            success: function (res) {
              console.log(res)
            },
            'fail': function (res) {
              console.log(res);
            }
          })
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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