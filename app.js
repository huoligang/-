//app.js
const fn = require('/utils/function.js');
App({
  onLaunch: function (res) {
    // console.log(res.shareTicket);
    // console.log("上面ticket")
    var that = this;
    this.globalData.Gid = res.shareTicket;
    wx.getShareInfo({
      shareTicket: res.shareTicket,
      success(res){
        // console.log(res)
      }
    })
    if (wx.getUpdateManager) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        // console.log(res.hasUpdate)
      })
      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })
      })
      updateManager.onUpdateFailed(function () {
        wx.showModal({
          title: '更新失败！',
          content: '请手动删除小程序后重新打开。',
        })
      })
    }
  },
  // 从前台进入后台
  onHide: function () {
    var that = this;
    fn.http({
      param: { func: "user.leaveTime", user_id: that.globalData.user_id },
      success: function (res) {
        // console.log(res);
      }
    })
  },
  //获取openid
  getUserOpenId: function (friend_u_id, tuiguang_id) {
    let that = this;
    var friend_user_id = friend_u_id;
    var tuiguang_id = tuiguang_id;
    let param;
    var friend_u_id = friend_u_id;
    var pormise = new Promise(function (resolve, reject) {
      wx.login({
        success: function (res) {
          // console.log(res.code);
          var param;
          if (friend_user_id){
            param = { func: "user.login", code: res.code, friend_user_id: friend_user_id };
          }else if (tuiguang_id){
            param = { func: "user.login", code: res.code, recommend_id: tuiguang_id};
          }else{
            param = { func: "user.login", code: res.code};
          }
          if (res.code) {
            fn.http({
              param: param,
              success: function (res) {
                var popData = res.friend;
                var res = res.arr;
                that.globalData.user_id = res.user_id//用户ID
                that.globalData.isUserId = res.user_id //用户ID
                that.globalData.is_new = res.is_new//是否是新用户
                that.globalData.is_lock = res.is_lock//是否是新用户
                that.globalData.popData = popData
                // 获取用户信息
                // that.getUserMsg();
                // 获取分享数据
                that.getShareData();
                fn.http({
                  param: { func: "user.me", user_id: that.globalData.user_id },
                  success: function (res) {
                    // console.log(res.userinfo)
                    that.globalData.balance = res.userinfo.balance//余额
                    that.globalData.glamour = res.userinfo.glamour//魅力值
                    that.globalData.user_name = res.userinfo.nickname//用户名称
                    that.globalData.header = res.userinfo.head//用户头像
                    that.globalData.honglog = res.userinfo.honglog//0否 1是 2审核
                    that.globalData.gender = res.userinfo.gender//性别
                    that.globalData.height = res.userinfo.height//身高
                    that.globalData.touringcar = res.userinfo.touringcar//房车
                    that.globalData.userState = res.userinfo.status//用户被举报举报状态
                    that.globalData.userMyself = res.userinfo
                    that.globalData.server = res.server
                    resolve('')
                  }
                })
              }
            })
          } else {
            resolve('')
            // console.log('获取用户登录态失败！' + res.errMsg)
          }
        }
      })
    })
    return pormise
  },
  // 获取用户信息
  getUserMsg(res){
    var that = this;
    fn.http({
      param: { func: "user.me",user_id:that.globalData.user_id },
      success: function (res) {
        // console.log(res.userinfo)
        that.globalData.balance = res.userinfo.balance//余额
        that.globalData.glamour = res.userinfo.glamour//魅力值
        that.globalData.user_name = res.userinfo.name//用户名称
        that.globalData.header = res.userinfo.head//用户头像
        that.globalData.honglog = res.userinfo.honglog//0否 1是 2审核
        that.globalData.gender = res.userinfo.gender//性别
        that.globalData.height = res.userinfo.height//身高
        that.globalData.touringcar = res.userinfo.touringcar//房车
        that.globalData.userState = res.userinfo.status//用户被举报举报状态
        that.globalData.userMyself = res.userinfo
        that.globalData.server = res.server
      }
    })
  },
  // 获取分享数据
  getShareData(res){
    var that = this;
    fn.http({
      param: { func: "share.getData", user_id: that.globalData.user_id },
      success: function (res) {
        // console.log(res.data)
        that.globalData.shareData = res.data.data//分享数据
      }
    })
  },
  globalData: {
    userInfo: null,
    txUrl:"https://luck.liunianshiguang.com/",
    isUserId:false,
    is_at_chat: false,
    redData: [],
    is_login:false,
    socketonLine:false,
    mineHintState:true
  }
})