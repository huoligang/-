// pages/red/red.js
const fn = require('../../utils/function.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tequanState: false,
    xinren: ['新人', '全部'],
    xinrenIndex: 0,
    sex: ['性别', '男', '女'],
    sexIndex: 0,
    age: ['年龄段', '20~25', '25~30', '30~35', '35~40', '40~45', '45以上'],
    ageIndex: 0,
    xl: ['学历', '专科以下', '专科', '本科', '硕士', '博士及以上'],
    xlIndex: 0,
    xz: ['收入', '1000~5000', '5000~10000', '10000~20000', '20000以上'],
    xzIndex: 0,
    fc: ['车房', '无车无房', '无车有房', '有车无房', '有车有房'],
    fcIndex: 0,
    xzPop: ['收入', '1000~5000', '5000~10000', '10000~20000', '20000以上'],
    xzIndexPop: 0,
    fcPop: ['车房', '无车无房', '无车有房', '有车无房', '有车有房'],
    fcIndexPop: 0,
    zhezhao: false,
    popS2Box: false,
    latitude: 39.9219,
    longitude: 116.44355,
    markers: [{
      latitude: 39.9219,
      longitude: 116.44355,
    }],
    mapShow: true,
    centerTabIndex: 1,
    headerName: "附近的红娘",
    is_loading: true,
    gw: ['过往', '未婚', '离异'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    // wx.showLoading({
    //   title: '加载中',
    // })
    var friend_u_id = options.friend_u_id;
    var tuiguang_id = options.recommend_id ? options.recommend_id : options.friend_user_id ? options.friend_user_id : "";
    // if(app.globalData.user_id){
    //   that.setData({
    //     headerHeight2: app.globalData.headerHeight2,
    //     headerHeight: app.globalData.headerHeight
    //   })
    //   return false
    // }
    // 自定义导航栏高度
    var sis = wx.getSystemInfoSync();
    // console.log(sis)
    let height;
    let mtHeader;
    height = sis.statusBarHeight + 44;
    mtHeader = sis.statusBarHeight;
    that.setData({
      headerHeight: height + 'px',
      mtHeader: mtHeader + 'px',
      searchST: sis.windowHeight
    })
    app.globalData.headerHeight = height + 'px';
    app.globalData.mtHeader = sis.statusBarHeight + 'px';
    app.globalData.headerHeight2 = height;
    app.globalData.allHeight = height - sis.statusBarHeight + 'px';
    app.globalData.statusBarHeight = sis.statusBarHeight;
    app.globalData.topHeight = sis.statusBarHeight + 20 + 'px';
    app.getUserOpenId(friend_u_id, tuiguang_id).then(function() {
      that.setData({
        headerHeight2: app.globalData.headerHeight2,
        headerHeight: app.globalData.headerHeight,
        is_hn: app.globalData.honglog == 1 ? 0 : 0,
        headerName: app.globalData.userMyself.address1 + '附近的红娘和单身',
        honglog: app.globalData.honglog == 1 ? 1 : 0,
      })
      if (app.globalData.is_new || app.globalData.user_name == null) {
        wx.redirectTo({
          url: '../logs/logs?is_new=1',
          success: function(res) {},
          fail: function(res) {},
          complete: function(res) {},
        })
        // that.getLocation();
      } else if (app.globalData.is_lock) {
        wx.redirectTo({
          url: '../logs/logs?is_lock=1',
          success: function(res) {},
          fail: function(res) {},
          complete: function(res) {},
        })
      } else {
        that.getRed();
        that.singleRegiment();
        that.Recommend();
        that.getGift();
        that.getOrderLog();
      }
    })
    // that.getRecord();
  },
  // 获取红娘
  getRed(res) {
    var that = this;
    fn.http({
      param: {
        func: 'user.hongnear',
        user_id: app.globalData.user_id
      },
      success: function(res) {
        that.setData({
          redData: res.data,
          to_user_id: res.data[0].user_id,
        }, function() {
          // 获取红娘故事
          // getTempletList: function () {
          fn.http({
            param: {
              func: "chat.getTempletList",
              user_id: that.data.to_user_id
            },
            success: res => {
              that.setData({
                hnStoryList: res
              })
            }
          })
          // },
        })
        var markersData = [];
        var marker = [];
        for (var i in res.data) {
          marker[0] = res.data[i].markers
          // marker[0] = that.data.markers
          markersData.push(marker);
        }
        wx.hideLoading();
        that.setData({
          is_loading: false,
          markersData: markersData
        })
      }
    })
  },
  // 获取单身团
  singleRegiment(res) {
    var that = this;
    return false
    fn.http({
      param: {
        func: 'user.singleRegiment',
        district: app.globalData.userMyself.district,
        user_id: app.globalData.user_id
      },
      success: function(res) {
        // console.log(res);
        that.setData({
          searchData: res.data,
        })
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
    var data = res.currentTarget.dataset.msglist;

    // console.log(data)
    // return false
    var msglist = {};
    msglist.user_id = data.user_id;
    msglist.gender = data.gender;
    msglist.name = data.nickname;
    if (res.currentTarget.dataset.type && app.globalData.honglog != 1) {
      msglist.inType = 6;
      msglist.user_id = that.data.redData[0].user_id; //跟红娘聊天改变user_id
      msglist.gender = that.data.redData[0].gender;
      msglist.name = that.data.redData[0].nickname;
      // 推荐的单身用户，检验聊天次数
      app.globalData.chatData = msglist;
      fn.http({
        param: {
          func: 'chat.beforeChat',
          user_id: app.globalData.user_id,
          to_user_id: that.data.redData[0].user_id,
          introduce_id: data.user_id,
        },
        success: function(res) {
          // console.log(res);
          if (res.code == 0) {
            wx.navigateTo({
              url: '../chat/chat'
            })
          } else if (res.code == 1) {
            wx.showModal({
              title: '提示',
              content: '每天只可选择3人让红娘牵线确认是TA吗？',
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../chat/chat'
                  })
                } else if (res.cancel) {
                  // console.log('用户点击取消')
                }
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '次数不足',
              success(res) {}
            })
          }
        }
      })


    } else {
      msglist.inType = 2;
      app.globalData.chatData = msglist;
      wx.navigateTo({
        url: '../chat/chat',
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
  },
  // 是否新人
  xinrenChange(res) {
    this.setData({
      xinrenIndex: res.detail.value
    })
  },
  // 男女
  sexChange(res) {
    this.setData({
      sexIndex: res.detail.value
    })
  },
  // 年龄段
  ageChange(res) {
    this.setData({
      ageIndex: res.detail.value
    })
  },
  // 学历
  xlChange(res) {
    this.setData({
      xlIndex: res.detail.value
    })
  },
  // 薪资
  xzChange(res) {
    this.setData({
      xzIndex: res.detail.value
    })
  },
  // 房车
  fcChange(res) {
    this.setData({
      fcIndex: res.detail.value
    })
  },
  // 隐私信息弹窗
  // 姓名
  bindinputName(e) {
    this.setData({
      zcName: e.detail.value
    })
  },
  // 行业
  bindinputIndustry(e) {
    this.setData({
      industry: e.detail.value
    })
  },
  // 薪资
  xzChangePop(res) {
    this.setData({
      xzIndexPop: res.detail.value
    })
  },
  // 房车
  fcChangePop(res) {
    this.setData({
      fcIndexPop: res.detail.value
    })
  },
  // 获取手机号
  bindgetphonenumber(e) {
    var that = this;
  },
  // 隐私信息注册
  toTab4(res) {
    var that = this;
    if (that.data.xlIndex != 0 && that.data.xzIndexPop != 0 && that.data.fcIndexPop != 0) {
      fn.http({
        param: {
          func: 'user.userInfoRegister',
          user_id: app.globalData.user_id,
          educate: that.data.xlIndex,
          salary: that.data.xzIndexPop,
          touringcar: that.data.fcIndexPop,
          // industry: that.data.industry
        },
        success: function(res) {
          app.getUserMsg();
          that.setData({
            mapShow: true,
            popS2Box: false,
            zhezhao: false
          })
          if (that.data.msglist) {
            var msglist = that.data.msglist;
            app.globalData.chatData = msglist;
            wx.navigateTo({
              url: '../chat/chat'
            })
          }
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请完善您的信息',
        showCancel: false
      })
    }
  },
  // 搜索
  getRecord(res) {
    var that = this;
    fn.http({
      param: {
        func: 'chat.search',
        user_id: app.globalData.user_id,
        type: that.data.xinrenIndex == 0 ? 1 : 2,
        gender: that.data.sexIndex,
        age: that.data.ageIndex,
        educate: that.data.xlIndex,
        touringcar: that.data.fcIndex,
        salary: that.data.xzIndex,
        district: app.globalData.userMyself.district
      },
      success: function(res) {
        // var newData = res.data;
        // console.log(res);
        that.setData({
          searchData: res.data
        })
        if (res.data == "") {
          wx.showModal({
            title: '提示',
            content: '没有符合您要求的搜索对象',
            showCancel: false
          })
        } else {
          setTimeout(function() {
            wx.pageScrollTo({
              scrollTop: that.data.searchST / 2,
              duration: 300
            })
          }, 500)
        }
      }
    })
  },
  // 关闭所有弹窗
  colseAll(res) {
    var that = this;
    that.setData({
      mapShow: true,
      popS2Box: false,
      zhezhao: false,
      aqxyState: false,
      seeDetailState: false
    })
  },
  // 申请红娘
  redApply(res) {
    var that = this;
    wx.navigateTo({
      url: '../redApply/redApply',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  // 爱情宣言
  aqxy(res) {
    var that = this;
    var otherId = res.currentTarget ? res.currentTarget.dataset.id : res;
    fn.http({
      param: {
        func: "chat.getTempletList",
        user_id: otherId
      },
      success: res => {
        this.setData({
          mapShow: false,
          aqxyState: true,
          TempletList: res
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    if (app.globalData.user_id) {
      that.getRed();
      that.singleRegiment();
      that.Recommend();
      that.getGift();
      that.getOrderLog();
      that.setData({
        is_hn: app.globalData.honglog == 1 ? 0 : 0,
        headerName: app.globalData.userMyself.address1 + '附近的红娘和单身',
        honglog: app.globalData.honglog == 1 ? 1 : 0,
      })
    }
  },
  // 获取地理位置
  getLocation: function (res) {
    var that = this;
    return false
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
          param: {
            func: "user.getAddressInfo",
            user_id: app.globalData.user_id,
            lat: latitude,
            lon: longitude
          },
          success: function (res) {
            console.log(res);
            wx.hideLoading();
            that.setData({
              city: res.city,
              zhezhao: false
            })
          }
        })
      },
      fail: function (res) {
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
  // 获取订单记录
  getOrderLog(res) {
    var that = this;
    fn.http({
      param: {
        func: "pay.orderLog",
        district: app.globalData.userMyself.district
      },
      success: function(res) {
        that.setData({
          is_loading: false,
          orderLogData: res
        })
      }
    })
  },
  // 获取礼物
  getGift(res) {
    var that = this;
    fn.http({
      param: {
        func: "pay.getGift",
        user_id: app.globalData.user_id,
        district: app.globalData.userMyself.district
      },
      success: function(res) {
        // console.log(res);
        that.setData({
          giftData: res,
          bmMoney: res[0].g_price,
          bmMoney2: res[1].g_price,
          bmMoney3: res[2].g_price,
        })
      }
    })
  },
  // 报名费支付
  sendGift(res) {
    var that = this;
    var g_id = res.currentTarget.dataset.g_id;
    var payType = res.currentTarget.dataset.paytype;
    var bmMoney;
    if (payType == 1) {
      bmMoney = that.data.bmMoney
      if (that.data.bmMoney == null) {
        wx.showModal({
          title: '提示',
          content: '请输入报名费',
          showCancel: false
        })
        return false
      } else {
        that.toPay(bmMoney, g_id)
      }
    } else if (payType == 2) {
      bmMoney = that.data.bmMoney2
      if (that.data.bmMoney2 == null) {
        wx.showModal({
          title: '提示',
          content: '请输入报名费',
          showCancel: false
        })
        return false
      } else {
        that.toPay(bmMoney, g_id)
      }
    } else if (payType == 3) {
      bmMoney = that.data.bmMoney3
      if (that.data.bmMoney3 == null) {
        wx.showModal({
          title: '提示',
          content: '请输入报名费',
          showCancel: false
        })
        return false
      } else {
        that.toPay(bmMoney, g_id)
      }
    }

  },
  // 支付
  toPay(res, g_id) {
    var that = this;
    var bmMoney = res;
    var g_id = g_id;
    fn.http({
      param: {
        func: "pay.placeOrder",
        user_id: app.globalData.user_id,
        g_id: g_id,
        send_to_user_id: that.data.to_user_id,
        total_fee: bmMoney
      },
      success: function(res) {
        if (res.code == "-100018" || res.code == "-100021" || res.code == "-100030") {
          wx.showModal({
            title: '提示',
            content: res.msg,
            showCancel: false
          })
          return false
        }
        wx.requestPayment({
          appId: res.appId,
          timeStamp: String(res.timeStamp),
          nonceStr: res.nonceStr,
          package: res.package,
          signType: "MD5",
          paySign: res.paySign,
          success: function(res) {
            that.setData({
              bmMoney: null,
              bmMoney2: null,
              bmMoney3: null
            })
            // 刷新礼物
            that.getGift();
            // 获取订单记录
            that.getOrderLog();
          },
          'fail': function(res) {
            // console.log(res);
          }
        })
      }
    })
  },
  // 报名费输入
  baomingfei(res) {
    var that = this;
    that.setData({
      bmMoney: res.detail.value
    })
  },
  // 报名费输入
  baomingfei2(res) {
    var that = this;
    that.setData({
      bmMoney2: res.detail.value
    })
  },
  // 报名费输入
  baomingfei3(res) {
    var that = this;
    that.setData({
      bmMoney3: res.detail.value
    })
  },
  // 推荐人
  Recommend(res) {
    var that = this;
    fn.http({
      param: {
        func: "user.Recommend",
        user_id: app.globalData.user_id,
        district: app.globalData.userMyself.district
      },
      success: function(res) {
        that.setData({
          tjData: res.data
        })
      }
    })
  },
  // 拨打电话
  makePhone(res) {
    var that = this;
    var phone = res.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: String(phone),
    })
  },
  // 保存formID
  saveFormId(res) {
    var that = this;
    var formId = res.detail.formId;
    fn.http({
      param: {
        func: "user.addFormId",
        user_id: app.globalData.user_id,
        form_id: formId
      },
      success: function(res) {
        // console.log(res)
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  // 保存图片
  saveImg: function(res) {
    var that = this;
    wx.showLoading({
      title: '下载中...',
    })
    var other_id = res.currentTarget.dataset.id;
    fn.http({
      param: {
        func: "share.userImg",
        user_id: other_id,
      },
      success: function(res) {
        var imgUrl = res.img;
        wx.downloadFile({
          url: imgUrl,
          success: function(res) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function(res) {
                wx.hideLoading();
                wx.showModal({
                  title: '提示',
                  content: '照片合成二维码已保存到相册',
                  showCancel: false,
                  success: function(res) {}
                })
              },
              fail: function(res) {
                // console.log(res)
                wx.hideLoading();
                wx.showModal({
                  title: '提示',
                  content: '保存失败',
                  showCancel: false,
                  success: function(res) {
                    if (res.confirm) {
                      // console.log("用户点击确定")
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
  // 点击复制微信号
  copyWx(res) {
    var that = this;
    var wxh = res.currentTarget.dataset.wx;
    wx.setClipboardData({
      data: String(wxh),
      success: function(res) {
        wx.showModal({
          title: '提示',
          content: '复制红娘微信号成功，添加红娘微信为您牵线',
          showCancel: false
        });
      }
    })
  },
  copyWx2(res) {
    var that = this;
    var wxh = res.currentTarget.dataset.wx;
    wx.setClipboardData({
      data: String(wxh),
      success: function(res) {

      }
    })
  },
  //tab切换
  centerTab(res) {
    var that = this;
    var idx = res.currentTarget.dataset.idx;
    that.setData({
      centerTabIndex: idx
    })
  },
  // 点击头像查看详情
  seeDetail(res) {
    var that = this;
    var seeId = res.currentTarget.dataset.seeid
    fn.http({
      param: {
        func: 'user.myinfo',
        user_id: seeId
      },
      success: function(res) {
        that.setData({
          mapShow: false,
          zhezhao: true,
          seeDetailState: true,
          seeData: res.userinfo
        })
        // console.log(res);
        var seeData = res.userinfo;
        var copyMsg = '姓名：' + seeData.nickname + ';性别：' + (seeData.gender == 1 ? '男' : '女') + ';年龄：' + seeData.age + '岁' + ';故事：' + (seeData.t_content == null ? "对方暂未设置" : seeData.t_content) + ';生日：' + (2019 - seeData.age) + ';身高：' + seeData.height + 'cm' + ';家乡：' + (seeData.address == null ? '对方暂未设置' : seeData.address) + ';职业：' + (seeData.industry == null ? '对方暂未设置' : seeData.industry) + ';手机微信：' + (seeData.phone == null ? "对方暂未设置" : seeData.phone) + ';学历：' + (seeData.educate == null ? "对方暂未设置" : that.data.xl[seeData.educate]) + ';月薪：' + (seeData.salary == 0 ? "对方暂未设置" : that.data.xz[seeData.salary]) + ';房车：' + (seeData.touringcar == 0 ? '对方暂未设置' : that.data.fc[seeData.touringcar]) + ';过往：' + (seeData.marriage_history == 0 ? "对方暂未设置" : that.data.gw[seeData.marriage_history]) + ';生肖：' + (seeData.zodiac == null ? "对方暂未设置" : seeData.zodiac) + ';兄弟姐妹：' + (seeData.family == null ? "对方暂未设置" : seeData.family) + ';父母：' + (seeData.parent == null ? "对方暂未设置" : seeData.parent) + ';兴趣：' + (seeData.interest == null ? "对方暂未设置" : seeData.interest) +';和谁住：' + (seeData.with_who == null ? "对方暂未设置" : seeData.with_who);
        that.setData({
          copyMsg: copyMsg
        })
      }
    })
  },
  // 点击复制资料
  copyMsg(res) {
    var that = this;
    wx.setClipboardData({
      data: String(that.data.copyMsg),
      success: function (res) {}
    })
  },
  //点击举报故事
  jbBtn(res) {
    var that = this;
    var t_id = res.currentTarget.dataset.t_id;
    wx.showModal({
      title: '提示',
      content: '是否举报该用户',
      success(res) {
        if (res.confirm) {
          fn.http({
            param: {
              func: "report.chatTemplet",
              from_user_id: app.globalData.user_id,
              to_user_id: that.data.to_user_id,
              reason: "举报不需要理由",
              t_id: t_id
            },
            success: function(res) {
              wx.showToast({
                title: '举报成功',
                icon: 'none',
                duration: 1500
              })
            }
          })
        }
      }
    })
  },
  // 点赞故事
  dzBtn(res) {
    var that = this;
    var t_id = res.currentTarget.dataset.t_id;
    var user_id = res.currentTarget.dataset.user_id;
    fn.http({
      param: {
        func: "chat.thumbup",
        t_id: t_id,
        user_id: app.globalData.user_id
      },
      success: function(res) {
        that.aqxy(user_id);
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var that = this;
    wx.showShareMenu({
      withShareTicket: true
    })
    return {
      title: app.globalData.shareData.share_msg,
      path: '/pages/red/red?friend_u_id=' + app.globalData.user_id,
      imageUrl: app.globalData.shareData.share_img,
      success: function(res) {
        // console.log(res)
      }
    }
  }
})