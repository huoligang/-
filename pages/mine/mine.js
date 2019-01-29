// pages/mine/mine.js
const fn = require('../../utils/function.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bottomState: false,//底部套路模板显示
    infocus:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      headerHeight:app.globalData.headerHeight,
      mtHeader: app.globalData.mtHeader,
      headerHeight2: app.globalData.headerHeight2,
      honglog: app.globalData.honglog
    })
    fn.http({
      param: { func: 'share.saveImg', user_id: app.globalData.user_id },
      success: function (res) {
        that.setData({
          saveImg:res.img
        })
      }
    })
  },
  // 保存图片
  saveImg: function (res) {
    var that = this;
    wx.showLoading({
      title: '下载中...',
    })
    fn.http({
      param: { func: 'share.saveImg', user_id: app.globalData.user_id },
      success: function (res) {
        console.log(res);
        // return
        var imgUrl = res.img;
        wx.downloadFile({
          url: imgUrl,
          success: function (res) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function (res) {
                wx.hideLoading();
                wx.showModal({
                  title: '提示',
                  content: '成功保存到相册',
                  showCancel: false,
                  success: function (res) { }
                })
              }, fail: function (res) {
                console.log(res)
                wx.hideLoading();
                wx.showModal({
                  title: '提示',
                  content: '请授权后保存图片',
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      console.log("用户点击确定")
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              }
            })
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  // 重新定位按钮
  reposition(res){
    var that = this;
    that.setData({
      zhezhaoState:true,
      repositionState:true
    })
  },
  // 重新定位按钮
  repositionBtn(res){
    var that = this;
    that.getLocation();
  },
  getLocation: function (res) {
    var that = this;
    // 获取位置
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        app.globalData.latitude = latitude;
        app.globalData.longitude = longitude;
        var speed = res.speed
        var accuracy = res.accuracy
        fn.http({
          param: { func: "user.getAddressInfo", user_id: app.globalData.user_id, lat: latitude, lon: longitude },
          success: function (res) {
            that.closeAll();
            wx.showToast({
              title: '成功',
              icon: 'success',
              duration: 1500
            })
          }
        })
      }, fail: function (res) {
        that.closeAll();
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 1500
        })
        // wx.showModal({
        //   title: '提示',
        //   content: "请授权地理位置后使用",
        //   showCancel: false,
        //   success: function (res) {
        //     wx.openSetting({})
        //   }
        // })
      }
    })
  },
  // 去用户详情
  toUserMessages(res){
    var that = this;
    wx.navigateTo({
      url: '../userMessages/userMessages',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  // 去用户余额
  toMoney(res){
    wx.navigateTo({
      url: '../money/money',
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    that.setData({
      now_t_id:app.globalData.now_t_id
    })
    fn.http({
      param: { func: "user.me", user_id: app.globalData.user_id },
      success: function (res) {
        var userMyself = res.userinfo;
        app.globalData.cs = res.userinfo;
        that.setData({
          balance: userMyself.balance,//余额
          glamour: userMyself.glamour,//魅力值
          user_name: userMyself.nickname,//用户名称
          head: userMyself.head,
          honglog:userMyself.honglog,
          userImg: userMyself.img,
          userData: userMyself,
          isIos: app.globalData.isIos,
          hintState: app.globalData.mineHintState
        })
      }
    })
    // 获取用户故事
    that.getTempletList();
  },
  // 取消添加桌面
  qxBtn(res){
    var that = this;
    that.setData({
      hintState:false
    })
    app.globalData.mineHintState = false
  },
  // 申请红娘
  redApply(res){
    var that = this;
    wx.navigateTo({
      url: '../redApply/redApply',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // 获取用户信息
    app.getUserMsg();
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
  },
  // 获取用户消息模板
  getTempletList: function () {
    fn.http({
      param: { func: "chat.getTempletList", user_id: app.globalData.user_id },
      success: res => {
        this.setData({
          TempletList: res
        })
      }
    })
  },
  // 点击添加编辑故事
  addMuban(res) {
    var that = this;
    var type = res.currentTarget.dataset.type;//编辑1 增加2
    if (type == 1) {
      var itemData = res.currentTarget.dataset.itemdata;
      console.log(itemData);
      that.setData({
        // intoViewVal: 'inToView'+66,
        bottomState: false,
        bjStoryState: true,
        bjStoryData: itemData
      })
    } else {
      that.setData({
        // intoViewVal: 'inToView'+66,
        bottomState: false,
        addmubanState: true
      })
    }

  },
  // 删除故事
  deleteStory(res) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否删除该故事',
      success(res) {
        if (res.confirm) {
          fn.http({
            param: { func: "chat.deltemp", t_id: that.data.bjStoryData.t_id },
            success: res => {
              // 刷新模板消息
              that.getTempletList();
              that.setData({
                bjStoryData: null,
                bjStoryState: false,
                bottomState: true,
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  // 编辑弹窗关闭按钮
  bjCloseBtn(res) {
    var that = this;
    that.setData({
      bjStoryState: false,
      bottomState: true
    })
  },
  //底部显示隐藏
  addBtn: function (res) {
    var that = this;
    that.setData({
      zhezhao: true,
      bottomState: !that.data.bottomState
    })
  },
  // 关闭所有
  closeAll(res) {
    var that = this;
    if (that.data.addmubanState) {
      that.setData({
        addmubanState: false,
        bottomState: true
      })
    } else if (that.data.bjStoryState){
      that.setData({
        bjStoryState: false,
        bottomState: true
      })
    } else {
      that.setData({
        zhezhao: false,
        bottomState: false,
        seeDetailState: false,
        popS1Box: false,
        popS2Box: false,
        intoViewVal: "",
        bjIndex: null,
        infocus: true,
        addmubanState: false,
        zhezhaoState: false,
        repositionState: false,
      })
    }
  },
  // 点击编辑
  bjBtn(res) {
    var that = this;
    var idx = res.currentTarget.dataset.bjidx;
    that.setData({
      bjIndex: idx,
      infocus: false
    })
  },
  // 失去焦点修改模板消息
  bindblur: function (res) {
    var that = this;
    var new_content = res.detail.value;
    var listData = that.data.bjStoryData;
    console.log(listData)
    if (!new_content || new_content.length < 20 || new_content.length > 500) {
      wx.showModal({
        title: '提示',
        content: '字数不少于20字不多于500字',
        showCancel: false
      })
      return false;
    }
    fn.http({
      param: {
        func: "chat.updTemplet",
        t_id: listData.t_id,
        t_content: new_content,
        user_id: app.globalData.user_id
      },
      success: function (res) {
        // 刷新模板消息
        that.getTempletList();
        that.setData({
          bjIndex: null,
          list_idx: null,
          infocus: true
        })
      }
    })
  },
  // 点击上PK台
  radioClick(res) {
    var that = this;
    var item = res.currentTarget.dataset.item;
    var bjStoryData = that.data.bjStoryData;
    if (item.t_id == app.globalData.now_t_id) {
      return false
    } else {
      wx.showModal({
        title: '提示',
        content: '选择此故事参与PK吸引他人和你聊天',
        success(res) {
          if (res.confirm) {
            fn.http({
              param: { func: "chat.templet_pk", user_id: app.globalData.user_id, t_id: item.t_id },
              success: function (res) {
                bjStoryData.t_id = item.t_id;
                app.globalData.now_t_id = item.t_id;
                that.setData({ now_t_id: item.t_id, bjStoryData: bjStoryData })
              }
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
    // that.bindconfirm(item);
  },
  // 添加故事
  confirmBtn: function (res) {
    console.log("123")
    var that = this;
    var new_content = that.data.temTextAreaValue;
    if (!new_content || new_content.length < 20 || new_content.length > 500) {
      wx.showModal({
        title: '提示',
        content: '字数不少于20字不多于500字',
        showCancel: false
      })
      return false
    }
    fn.http({
      param: { func: "chat.addTemplet", user_id: app.globalData.user_id, t_content: new_content, gender: app.globalData.gender },
      success: function (res) {//添加模板消息成功
        // 刷新模板消息
        that.getTempletList();
        that.setData({
          bottomState: true,
          bottomTextArea: true,
          addmubanState: false,
          infocus: true
        })
      }
    })
  },
  // 故事输入
  mubanSave: function (res) {
    var that = this;
    var val = res.detail.value;
    that.setData({
      temTextAreaValue: val
    })
  },
  // 用户须知
  specification(res){
    wx.navigateTo({
      url: '../specification/specification',
    })
  },
  // 红娘服务
  specification2(res) {
    wx.navigateTo({
      url: '../specification2/specification2',
    })
  }
})