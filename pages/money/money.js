const fn = require('../../utils/function.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabIndex:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      headerHeight: app.globalData.headerHeight,
      mtHeader: app.globalData.mtHeader,
      headerHeight2: app.globalData.headerHeight2
    })
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
    var that = this;
    that.getUserMsg();
    that.getOrderLog();
    that.getUserLog();
    
  },
  // 获取用户信息
  getUserMsg(){
    var that = this;
    fn.http({
      param: { func: "user.me", user_id: app.globalData.user_id },
      success: function (res) {
        var userMyself = res.userinfo;
        app.globalData.cs = res.userinfo;
        console.log(userMyself)
        that.setData({
          userData: userMyself
        })
        //牵线服务
        that.getpullorderLog();
      }
    })
  },
  // 提现
  tixian(res) {
    var that = this;
    fn.http({
      param: { func: 'pay.merchantPay', user_id: app.globalData.user_id, balance: that.data.userData.balance },
      success: function (res) {
        that.getUserMsg();
      }
    })
  },
  // 红娘服务
  getOrderLog(res) {
    var that = this;
    fn.http({
      param: {
        func: "pay.orderLog",
        district: app.globalData.userMyself.district
      },
      success: function (res) {
        that.setData({
          orderLogData: res
        })
      }
    })
  },
  //报名活动
  getUserLog(res) {
    var that = this;
    fn.http({
      param: {
        func: "pay.userOrder",
        user_id: app.globalData.user_id,
      },
      success: function (res) {
        that.setData({
          userLogData: res
        })
      }
    })
  },
  //牵线服务
  getpullorderLog(res) {
    var that = this;
    fn.http({
      param: {
        func: "pay.pullorderLog",
        // district: that.data.userData.district,
        user_id: app.globalData.user_id
      },
      success: function (res) {
        that.setData({
          pullorderLog: res
        })
      }
    })
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

  },
  // 返回
  backMine(res) {
    var that = this;
    wx.switchTab({
      url: '../mine/mine',
    })
  },
  // 切换tab
  tab(res){
    var idx = res.currentTarget.dataset.idx;
    this.setData({
      tabIndex:idx
    })
  }
})