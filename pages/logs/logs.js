//logs.js
const util = require('../../utils/util.js');
const fn = require('../../utils/function.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageSort: 1,
    loadDone:false,
    zhezhaoState: false,
    aqxyState:false,
    is_lock:false,
    multiArray: [['省'], ['市'],['县']],
    multiIndex: [0, 0, 0],
    column:0,
    touringcarData : ['请选择','无房无车', '有房有车', '无房有车', '有房无车'],
    jobData: ['请选择职业','技术', '产品', '设计', '运营','市场与销售','职能','金融'],
    sexData: ['请选择','男','女'],
    sexIndex: 0,
    touringcarDataIndex:0,
    house:0,
    job:0,
    region: ['北京市', '北京市', '朝阳区'],
    shengIndex:0,
    shiIndex:0,
    xianIndex:0,
    province_id:0,
    city_id:0,
    county_id:0,
    ageIndex:0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      nickName: app.globalData.user_name,
      // ['multiArray[0]']: that.data.multiArray2[0],
      // ['multiArray[1]']: that.data.multiArray2[1][0],
      is_lock: options.is_lock?true:false,
      is_new:options.is_new?true:false
    })
    console.log(that.data.is_lock)
    app.getUserOpenId().then(function(){
      // 获取随机昵称
      fn.http({
        param: { func: "user.getNickName" },
        success: function (res) {
          console.log(res);
          app.globalData.user_nickname = res.nickname//用户随机昵称
          that.setData({
            // nickname: res.nickname,
            nickName : app.globalData.user_name,
            loadDone: true
          })
        }
      })
      // 获取被封时间
      that.checkProhibitSealTime();
    })
    that.getSheng();
    var ageData=[];
    that.setData({ageData:ageData})
  },
  // 解封
  unseal(res){
    fn.http({
      param: { func: "pay.unseal", user_id: app.globalData.user_id },
      success: function (res) {
        wx.requestPayment({
          appId: res.appId,
          timeStamp: String(res.timeStamp),
          nonceStr: res.nonceStr,
          package: res.package,
          signType: "MD5",
          paySign: res.paySign,
          success: function (res) {
            wx.switchTab({
              url: '../red/red',
            })
          },
          'fail': function (res) {
            console.log(res);
          }
        })
      }
    })
  },
  // 发送故事
  sendStory(res){
    var that = this;
    fn.http({
      param: { func: "chat.updTemplet", user_id: app.globalData.user_id, t_id: that.data.sjStory.t_id, t_content: that.data.sjStory.t_content },
      success: function (res) {
        that.setData({aqxyState: false})
        wx.switchTab({
          url: '../red/red',
        })
      }
    })
  },
  // 获取随机故事
  getSjStory(res){
    var that = this;
    fn.http({
      param: { func: "chat.getrandtemplet", gender:1,user_id:app.globalData.user_id },
      success: function (res) {
        that.setData({
          sjStory:res
        })
      }
    })
  },
  // 关闭所有弹窗
  closeAll(res){
    var that = this;
    that.setData({
      aqxyState: false
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
    app.globalData.is_at_chat = false;
    this.getLocation();
    wx.setStorage({
      key: 'is_new',
      data: 1
    })
  },
  // 获取地理位置
  getLocation: function (res) {
    var that = this;
    // 获取位置
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log(res)
        var latitude = res.latitude
        var longitude = res.longitude
        app.globalData.latitude = latitude;
        app.globalData.longitude = longitude;
        var speed = res.speed
        var accuracy = res.accuracy
        fn.http({
          param: { func: "user.getAddressInfo", user_id: app.globalData.user_id, lat: latitude, lon: longitude },
          success: function (res) {
            console.log(res);
            wx.hideLoading();
            that.hongUser(res.district);
          }
        })
      }, fail: function (res) {
        wx.showModal({
          title: '提示',
          content: "请授权地理位置后使用",
          showCancel: false,
          success: function (res) {
            wx.openSetting({})
          }
        })
      }
    })
  },
  // 记录红娘的区域来的用户
  hongUser(district){
    var that = this;
    fn.http({
      param: { func: "user.hongUser", user_id: app.globalData.user_id, district: district },
      success: function (res) {
        console.log(res);
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
  onShareAppMessage: function (res) {
    console.log(res);
    wx.showShareMenu({
      withShareTicket:true
    })
    return {
      title: app.globalData.shareData.share_msg,
      path: '/pages/red/red?friend_u_id=' + app.globalData.user_id,
      imageUrl: app.globalData.shareData.share_img,
      success: function (res) { }
    }
    return false
  },
  // 点击出现随机故事弹窗
  aqxyShow(res){
    var that = this;
    that.getSjStory();
    that.setData({ aqxyState: true })
  },
  // 保存用户信息
  getUserInfo:function(res){
    var that = this;
    var userInfo;
    if (res.detail.userInfo) {
      userInfo = res.detail.userInfo;
      console.log(userInfo)
      that.setData({
        nickName: userInfo.nickName
      })
      app.globalData.gender = userInfo.gender;
      fn.http({
        param: { func: "user.updateUserInfo", user_id: app.globalData.user_id, gender: userInfo.gender, nickname: userInfo.nickName, avatarurl: userInfo.avatarUrl},
        success: function (res) {
          // that.sendStory();
          wx.switchTab({
            url: '../red/red',
          })
        }
      })
    }
  },
  // 我知道了
  IKnow(res){
    this.setData({
      pageSort: 3
    })
    // wx.switchTab({
    //   url: '../index/index',
    // })
  },
  // 获取被封时间
  checkProhibitSealTime(res){
    var that = this;
    fn.http({
      param: { func: "user.checkProhibitSealTime",user_id: app.globalData.user_id },
      success: function (res) {
        that.setData({
          sealTime: res.time
        })
      }
    })
  }
})