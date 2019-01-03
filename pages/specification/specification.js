const fn = require('../../utils/function.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showIndex:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      headerHeight: (app.globalData.headerHeight2 - 0) * 2 + 10 + 'rpx',
      headerHeight2: app.globalData.headerHeight2
    })
  },
  showThis(res){
    var that = this;
    var idx = res.currentTarget.dataset.idx;
    that.setData({
      showIndex: that.data.showIndex == idx?0:idx
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
})