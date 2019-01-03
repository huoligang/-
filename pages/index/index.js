//index.js
//获取应用实例
const util = require('../../utils/util.js');
const fn = require('../../utils/function.js');
const app = getApp();
let index = 0;
let i = 0;
let topMsgList = [];
let bottomMsgList = [];
let bottomMsgList2 = [];
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hintData: {
      'reportState': false, //举报成功弹窗
    },
    msgData: [],
    topMsg: "",
    bottomMsg: "",
    isChangeBarrage: false,
    scrollTop: 0,
    bottomTextArea: true, //添加套路状态
    chatValue: "", //聊天输入框默认为空
    tab: 1,
    is_vip: false,
    zhezhao: true,
    is_loading: true,
    reportHintState: false, //底部举报成功提示文字
    radioSelectIndex: 0,
    showIdx: 0,
    meWantSay: "",
    addmubanState: false,
    seeDetailState: false,
    gsPage: 1,
    popS1Box: false, //基本信息注册
    popS2Box: false, //隐私信息注册
    sexData: ['男', '女'],
    sexIndex: 0,
    age: 1992,
    ageIndex: 8,
    multiIndex: 0,
    xz: ['收入', '1000~5000', '5000~10000', '10000~20000', '20000以上'],
    xzIndex: 0,
    fc: ['无车无房', '无车有房', '有车无房', '有车有房'],
    fcIndex: 0,
    xl: ['学历', '高中及以下', '专科', '本科', '硕士', '博士及以下'],
    xlIndex: 0,
    yqPopIndex: 1,
    yqPopState: false,
    xrPopState: false,
    userHeight: 168,
    infocus: true,
    online_unline: true,
    bottomSpace: true,
    oneOpacity: 1,
    tab: 1,
    animationData: {},
    animationData2: {},
    animationData3: {},
    twoBox3State: true,
    twoBox4State: true,
    animationIndex: 1
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // return false
    console.log(options)
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    var friend_u_id = options.friend_u_id;
    var tuiguang_id = options.friend_user_id;
    const {
      msgData
    } = that.data;
    var sis = wx.getSystemInfoSync();
    console.log(sis)
    console.log("上面是手机型号信息")
    // 自定义导航栏高度
    let height;
    height = 64
    if (sis.model == 'iPhone X') {
      height = 88
    }
    if (sis.platform == 'android') {
      height = 72;
    } else if (sis.platform == 'ios') {
      app.globalData.isIos = true
    } else {
      app.globalData.isIos = false
    }
    that.setData({
      height: height + 'px',
      height2: height,
      _h: sis.screenHeight - height + 'px',
      _w: sis.screenWidth,
      statusBarHeight: sis.statusBarHeight,
      testHeight: sis.screenHeight - sis.windowHeight + sis.statusBarHeight
    })
    app.globalData.headerHeight = height + 'px';
    app.globalData.headerHeight2 = height;
    app.globalData.allHeight = height - sis.statusBarHeight + 'px';
    app.globalData.statusBarHeight = sis.statusBarHeight;
    app.globalData.topHeight = sis.statusBarHeight + 20 + 'px';
    app.getUserOpenId(friend_u_id, tuiguang_id).then(function() {
      that.setData({
        user_id: app.globalData.user_id,
        honglog: app.globalData.honglog //0否 1是 2审核
      })
      // if (app.globalData.is_new || app.globalData.user_name == null) {
      //   wx.redirectTo({
      //     url: '../logs/logs?is_new=1',
      //     success: function(res) {},
      //     fail: function(res) {},
      //     complete: function(res) {},
      //   })
      // } else 
      if (app.globalData.is_lock) {
        wx.redirectTo({
          url: '../logs/logs?is_lock=1',
          success: function(res) {},
          fail: function(res) {},
          complete: function(res) {},
        })
      } else {
        // 邀请弹框
        that.yqPop();
        // 获取用户故事模板
        that.getTempletList();
        // 获取用户信息
        fn.http({
          param: {
            func: "user.me",
            user_id: app.globalData.user_id
          },
          success: function(res) {
            app.globalData.gender = res.userinfo.gender //性别
            // app.globalData.t_id = res.userinfo.t_id//当前故事ID
            app.globalData.now_t_id = res.userinfo.t_id;
            that.setData({
              now_t_id: res.userinfo.t_id
            })
            that.getIndexData();
          }
        })
        // 获取地理位置
        that.getLocation();
      }
    })
  },
  // 去重
  unique(arr) {
    var res = [arr[0]];
    for (var i = 1; i < arr.length; i++) {
      var repeat = false;
      for (var j = 0; j < res.length; j++) {
        res[j]['is_read'] = 0
        if (arr[i]['from_user_id'] == res[j]['from_user_id']) {
          res[j] = arr[i];
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
  // 显示下标
  showText(res) {
    var that = this;
    var idx = res.currentTarget.dataset.idx;
    that.setData({
      showIdx: that.data.showIdx == idx ? 0 : idx
    })
  },
  // 我想说的话
  meWant(res) {
    var that = this;
    that.setData({
      meWantSay: res.detail.value
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
          zhezhao: true,
          seeDetailState: true,
          seeData: res.userinfo
        })
        console.log(res);
      }
    })
  },
  // 发送消息---废弃
  bindconfirm: function(res) {
    var that = this;
    app.globalData.now_t_id = res.t_id;
    fn.http({
      param: {
        func: "chat.updTemplet",
        t_id: res.t_id,
        t_content: res.t_content,
        user_id: app.globalData.user_id
      },
      success: function(res) {
        if (res.code == '-100032') {
          wx.showModal({
            title: '提示',
            content: res.msg,
            showCancel: false
          })
        } else {
          // 获取首页消息
          that.getIndexData();
          // 关闭所有
          that.closeAll();
          that.setData({
            chatValue: "",
            meWantSay: ""
          })
        }
      }
    })
  },
  fasong: function(res) {
    var that = this;
    var chatValue = that.data.chatValue;
    if (!chatValue) {
      return false;
    } //空消息返回
    fn.http({
      param: {
        func: "chat.sendTemplet",
        user_id: app.globalData.user_id,
        content: chatValue
      },
      success: function(res) {
        console.log(res);
        if (res.code == '-100010') {
          wx.showModal({
            title: '提示',
            content: res.msg,
            showCancel: false
          })
        } else {
          // 获取首页消息
          that.getIndexData();
          that.setData({
            chatValue: ""
          })
        }
      }
    })
  },
  // 点击模板消息
  listClick: function(res) {
    var that = this;
    var listvalue = res.currentTarget.dataset.listvalue;
    var list_idx = res.currentTarget.dataset.list_idx;
    console.log(list_idx);
    var idx = res.currentTarget.dataset.idx;
    if (list_idx != idx) {
      that.setData({
        chatValue: listvalue
      })
    }
  },
  // 点击单选对号
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
              param: {
                func: "chat.templet_pk",
                user_id: app.globalData.user_id,
                t_id: item.t_id
              },
              success: function(res) {
                bjStoryData.t_id = item.t_id;
                app.globalData.now_t_id = item.t_id;
                that.setData({
                  now_t_id: item.t_id,
                  bjStoryData: bjStoryData
                })
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
  // 点击编辑
  bjBtn(res) {
    var that = this;
    var idx = res.currentTarget.dataset.bjidx;
    that.setData({
      bjIndex: idx,
      infocus: false
    })
  },
  // tab切换
  cutTab: function(res) {
    var that = this;
    var tab = res.currentTarget.dataset.tab;
    that.setData({
      tab: tab
    })
    // 获取首页消息
    that.getIndexData();
  },
  // 点击举报
  reportBtn: function(res) {
    var that = this;
    var to_user_id = res.currentTarget.dataset.user_id; //被举报人ID
    var t_id = res.currentTarget.dataset.t_id; //举报的模板ID
    wx.showModal({
      title: '提示',
      content: '是否举报该用户',
      success(res) {
        if (res.confirm) {
          fn.http({
            param: {
              func: "report.chatTemplet",
              from_user_id: app.globalData.user_id,
              to_user_id: to_user_id,
              reason: "举报不需要理由",
              t_id: t_id
            },
            success: function(res) {
              if (res.code == "-100015") {
                wx.showModal({
                  title: '提示',
                  content: res.msg,
                  showCancel: false
                })
              } else {
                that.closeAll();
                that.setData({
                  reportHintState: true
                })
                setTimeout(function() {
                  that.setData({
                    reportHintState: false
                  })
                }, 1500)
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
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
        console.log(res)
      }
    })
  },
  // 点击关闭弹窗
  closeBtn: function(res) {
    var that = this;
    that.setData({
      ["hintData.reportState"]: false
    })
  },
  // 点击消息进入聊天
  chat: function(res) {
    if (app.globalData.userState) {
      wx.showModal({
        title: '提示',
        content: "您被举报暂不能进行聊天",
        showCancel: false
      })
      return false
    }
    var that = this;
    var msglistData = res.currentTarget.dataset.msglist;
    var msglist = {};
    msglist.user_id = msglistData.user_id;
    msglist.gender = msglistData.gender;
    msglist.name = msglistData.nickname;
    console.log(msglistData)
    // return false
    if (!app.globalData.height && msglistData.honglog != 1) {
      that.setData({
        zhezhao: true,
        popS1Box: true,
        msglist: msglist
      })
    } else if (!app.globalData.touringcar && msglistData.honglog == 1) {
      console.log(app.globalData.touringcar)
      that.setData({
        zhezhao: true,
        popS2Box: true,
        msglist: msglist
      })
    } else if (msglist.user_id != app.globalData.user_id) {
      fn.http({
        param: {
          func: "user.addChat",
          from_user_id: app.globalData.user_id,
          m_id: msglist.m_id,
          to_user_id: msglist.user_id
        },
        success: function(res) {
          app.globalData.chatData = msglist;
          wx.navigateTo({
            url: '../chat/chat',
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
          })
        }
      })
      return false;
    }
  },
  // 底部点击加号
  textareaCk: function(res) {
    var that = this;
    that.setData({
      bottomTextArea: false
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  // 邀请弹窗
  yqPop(res) {
    var that = this;
    if (app.globalData.popData != "") {
      that.setData({
        yqText: app.globalData.popData[0],
        zhezhao2: true,
        yqPopState: true
      }, function() {
        var abc = app.globalData.popData;
        var abc2 = abc.splice(0, 1);
        app.globalData.popData = abc
      })
    } else if (app.globalData.server != "") {
      that.setData({
        xrText: app.globalData.server[0],
        zhezhao2: true,
        xrPopState: true
      }, function() {
        var server = app.globalData.server;
        var server2 = server.splice(0, 1);
        app.globalData.server = server
      })
    }
  },
  // 关闭邀请奖励弹窗
  yqCloseBtn(res) {
    var that = this;
    that.setData({
      zhezhao2: false,
      yqPopState: false,
      xrPopState: false,
    })
    that.yqPop();
  },
  // 和他聊聊
  toLiao(res) {
    var that = this;
    // var msglistData = that.data.xrText;
    var msglistData = res;
    var msglist = {};
    msglist.user_id = msglistData.user_id;
    msglist.gender = msglistData.gender;
    msglist.name = msglistData.nickname;
    that.setData({
      zhezhao2: false,
      yqPopState: false,
      xrPopState: false,
    })
    app.globalData.chatData = msglist;
    wx.navigateTo({
      url: '../chat/chat'
    })
  },
  // 第一部分事件
  oneCatch1(res) {
    this.setData({
      oneClientY: res.touches[0].clientY
    })
  },
  oneCatch2(res) {
    var that = this;
    var clientY = res.touches[0].clientY;
    wx.getStorage({
      key: 'is_new',
      success(res) {},
      fail(res) {
        that.setData({
          oneOpacity: 1 - ((that.data.oneClientY - clientY) / 50)
        })
      }
    })
    
  },
  oneCatch3(res) {
    console.log(res)
    var that = this;
    var clientY = res.changedTouches[0].clientY;
    wx.getStorage({
      key: 'is_new',
      success(res) {
        if (res.data) {
          that.getSjStory();
          that.setData({
            aqxyState: true
          })
        }
      },
      fail(res) {
        if (1 - ((that.data.oneClientY - clientY) / 50) <= 0) {
          that.setData({
            tab: 2
          }, function() {
            // return false
            const animation = wx.createAnimation({
              duration: 1000,
              timingFunction: 'ease',
            })
            const animation2 = wx.createAnimation({
              duration: 1000,
              timingFunction: 'ease',
            })
            const animation3 = wx.createAnimation({
              duration: 1000,
              timingFunction: 'ease',
            })
            const animation4 = wx.createAnimation({
              duration: 500,
              timingFunction: 'ease',
            })
            animation.opacity(1).step()
            animation2.translateX('100px').step()
            animation3.translateX('-100px').step()
            animation4.translateX('420px').step()
            animation4.translateX('400px').step({
              duration: 500
            })
            that.setData({
              animationData2: animation2.export(),
            })
            setTimeout(function() {
              that.setData({
                animationData3: animation3.export()
              })
            }, 800)
            setTimeout(function() {
              that.setData({
                animationData: animation.export(),
                // animationData4: animation4.export()
              }, function() {})
            }, 1600)
            setTimeout(function() {
              that.setData({
                // animationData: animation.export(),
                animationData4: animation4.export()
              }, function() {})
            }, 2400)

          })
        } else {
          that.setData({
            oneOpacity: 1
          })
        }
      }
    })
  },
  // 继续动画
  againAnimation(res) {
    var that = this;
    if (that.data.tab == 2) {
      that.setData({
        tab: 2,
        twoBox3State: true,
        twoBox4State: false,
        twoBox5State: false,
        twoBox6State: false
      }, function() {
        const animation = wx.createAnimation({
          duration: 1000,
          timingFunction: 'ease',
        })
        const animation2 = wx.createAnimation({
          duration: 1000,
          timingFunction: 'ease',
        })
        const animation3 = wx.createAnimation({
          duration: 1000,
          timingFunction: 'ease',
        })
        const animation4 = wx.createAnimation({
          duration: 500,
          timingFunction: 'ease',
        })
        animation.opacity(1).step()
        animation2.translateX('100px').step()
        animation3.translateX('-100px').step()
        animation4.translateX('420px').step()
        animation4.translateX('400px').step({
          duration: 500
        })
        that.setData({
          animationData2: animation2.export(),
        })
        setTimeout(function() {
          that.setData({
            animationData3: animation3.export()
          })
        }, 800)
        setTimeout(function() {
          that.setData({
            animationData: animation.export(),
          }, function() {})
        }, 1600)
        setTimeout(function() {
          that.setData({
            animationData4: animation4.export()
          }, function() {})
        }, 2400)
      })
    }
  },
  // 清空还原动画、重置动画
  resetAnimation(res) {
    var that = this;
    console.log(that.data.tab)
    console.log(that.data.animationIndex)
    if (that.data.tab == 1) {
      that.setData({
        tab: 1,
        animationIndex: 1
      })
    } else if (that.data.tab == 2 && that.data.twoBox3State) {
      that.setData({
        animationIndex: 1
      })
      const animation = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation2 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation3 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation4 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      animation.opacity(0).step()
      animation2.translateX('-100px').step()
      animation3.translateX('100px').step()
      animation4.translateX('0px').step()
      that.setData({
        tab: 2,
        twoBox6State: false,
        twoBox5State: false,
        twoBox4State: false,
        animationData: animation,
        animationData2: animation2,
        animationData3: animation3,
        animationData4: animation4
      })
      setTimeout(function() {
        that.againAnimation();
      }, 1000)
    } else if (that.data.tab == 2 && that.data.twoBox4State) {
      that.setData({
        animationIndex: 1
      })
      const animation = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation2 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation3 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation5 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      animation.opacity(0).step()
      animation2.translateX('-100px').step()
      animation3.translateX('100px').step()
      animation5.translateX('400px').step()
      that.setData({
        tab: 2,
        twoBox6State: false,
        twoBox5State: false,
        twoBox4State: false,
        animationData: animation,
        animationData2: animation2,
        animationData3: animation3,
        animationData5: animation5
      })
      setTimeout(function() {
        that.againAnimation();
      }, 1000)
    } else if (that.data.tab == 2 && that.data.twoBox5State && that.data.animationIndex == 3) {
      that.setData({
        animationIndex: 1
      })
      console.log(that.data.animationIndex)
      const animation = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation2 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation3 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation6 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation7 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation8 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation9 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation10 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation11 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation12 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation13 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation14 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation15 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })

      animation.opacity(0).step()
      animation2.translateX('-100px').step()
      animation3.translateX('100px').step()
      // 左边角色基本信息还原
      animation7.translateX('-150px').step();
      animation6.translateX('-150px').step();
      animation8.translateX('-150px').step();
      animation9.translateX('-150px').step();
      animation10.translateX('-150px').step();
      // 右边角色基本信息还原
      animation11.translateX('150px').step();
      animation12.translateX('150px').step();
      animation13.translateX('150px').step();
      animation14.translateX('150px').step();
      animation15.translateX('150px').step();
      that.setData({
        tab: 2,
        twoBox6State: false,
        twoBox5State: false,
        twoBox4State: false,
        animationData: animation,
        animationData2: animation2,
        animationData3: animation3,
        animationData6: animation6,
        animationData7: animation7,
        animationData8: animation8,
        animationData9: animation9,
        animationData10: animation10,
        animationData11: animation11,
        animationData12: animation12,
        animationData13: animation13,
        animationData14: animation14,
        animationData15: animation15,
      })
      setTimeout(function() {
        that.againAnimation();
      }, 1000)
    } else if (that.data.tab == 2 && that.data.twoBox6State && that.data.animationIndex == 4) {
      that.setData({
        animationIndex: 1
      })
      console.log(that.data.animationIndex)
      const animation = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation2 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation3 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation5 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation16 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation17 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation18 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })
      const animation19 = wx.createAnimation({
        duration: 100,
        timingFunction: 'ease',
      })

      animation.opacity(0).step()
      animation2.translateX('-100px').step()
      animation3.translateX('100px').step()
      animation5.translateX('400px').step();
      animation16.translateX('-200px').step();
      animation17.translateX('200px').step();
      animation18.translateX('80px').opacity(0).step();
      animation19.translateX('-80px').opacity(0).step();
      that.setData({
        tab: 2,
        twoBox6State: false,
        twoBox5State: false,
        twoBox4State: false,
        animationData: animation,
        animationData2: animation2,
        animationData3: animation3,
        animationData5: animation5,
        animationData16: animation16,
        animationData17: animation17,
        animationData18: animation18,
        animationData19: animation19,
      })
      setTimeout(function() {
        that.againAnimation();
      }, 1000)
    }
  },
  // 第二部分事件
  twoCatch1(res) {
    var that = this;
    this.setData({
      twoClientY: res.touches[0].clientY,
      twoClientX: res.touches[0].clientX
    })
    if (that.data.twoBox6State && res.touches[0].clientX<100){
      that.toLiao(that.data.msgData[0])
    } else if (that.data.twoBox6State && res.touches[0].clientX > 270){
      that.toLiao(that.data.msgData[1])
    }
  },
  twoCatch2(res) {
    var that = this;
    var clientY = res.touches[0].clientY;
    this.setData({
      twoOpacity: 1 - ((that.data.twoClientY - clientY) / 100)
    })
  },
  // 滑动
  twoCatch3(res) {
    var that = this;
    if (!that.data.ifUpto) {
      return false
    } else {
      that.setData({
        ifUpto: false
      });
      setTimeout(function() {
        that.setData({
          ifUpto: true
        });
      }, 2000)
    }
    var clientY = res.changedTouches[0].clientY;
    var clientX = res.changedTouches[0].clientX;
    if (1 - ((that.data.twoClientY - clientY) / 50) <= 0 && that.data.animationIndex == 1) {
      const animation4 = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
      })
      animation4.translateX('0px').step({
        duration: 500
      })
      that.setData({
        animationData4: animation4.export()
      }, function() {
        setTimeout(function() {
          that.setData({
            twoBox3State: false,
            twoBox4State: true
          })
          // 右边角色故事动画开始
          const animation5 = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease',
          })
          animation5.translateX('-420px').step()
          animation5.translateX('-400px').step({
            duration: 500
          })
          that.setData({
            animationData5: animation5.export(),
            animationIndex: 2
          })
        }, 500)
      })
    } else if (1 - ((that.data.twoClientY - clientY) / 50) <= 0 && that.data.animationIndex == 2) {
      // 第二次上划，右边角色故事消失
      const animation5 = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
      })
      animation5.translateX('400px').step()
      that.setData({
        animationData5: animation5.export(),
      })
      setTimeout(function() {
        that.setData({
          twoBox4State: false,
          twoBox5State: true,
          animationIndex: 3
        });
        // 用户基本信息动画
        const animation6 = wx.createAnimation({
          duration: 1000,
          timingFunction: 'ease',
        })
        const animation11 = wx.createAnimation({
          duration: 1000,
          timingFunction: 'ease',
        })
        animation6.translateX('150px').step();
        animation11.translateX('-150px').step();
        that.setData({
          animationData6: animation6.export(),
          animationData11: animation11.export(),
        })
        // 基本信息年龄动画
        setTimeout(function() {
          const animation7 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          const animation12 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          animation7.translateX('150px').step();
          animation12.translateX('-150px').step();
          that.setData({
            animationData7: animation7.export(),
            animationData12: animation12.export(),
          })
        }, 200)
        // 基本信息身高动画
        setTimeout(function() {
          const animation8 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          const animation13 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          animation8.translateX('150px').step();
          animation13.translateX('-150px').step();
          that.setData({
            animationData8: animation8.export(),
            animationData13: animation13.export(),
          })
        }, 400)
        // 基本信息职业动画
        setTimeout(function() {
          const animation9 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          const animation14 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          animation9.translateX('150px').step();
          animation14.translateX('-150px').step();
          that.setData({
            animationData9: animation9.export(),
            animationData14: animation14.export(),
          })
        }, 600)
        // 基本信息地址动画
        setTimeout(function() {
          const animation10 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          const animation15 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          animation10.translateX('150px').step();
          animation15.translateX('-150px').step();
          that.setData({
            animationData10: animation10.export(),
            animationData15: animation15.export(),
          })
        }, 800)
      }, 500)
    } else if (1 - ((that.data.twoClientY - clientY) / 50) <= 0 && that.data.animationIndex == 3) {
      // 右边角色故事消失
      const animation5 = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
      })
      animation5.translateX('-400px').step()
      that.setData({
        animationData5: animation5.export(),
      })
      setTimeout(function() {
        that.setData({
          animationIndex: 4
        });
        // 用户基本信息动画
        const animation6 = wx.createAnimation({
          duration: 1000,
          timingFunction: 'ease',
        })
        const animation11 = wx.createAnimation({
          duration: 1000,
          timingFunction: 'ease',
        })
        animation6.translateX('-100px').step();
        animation11.translateX('100px').step();
        that.setData({
          animationData6: animation6.export(),
          animationData11: animation11.export(),
        })
        // 基本信息年龄动画
        setTimeout(function() {
          const animation7 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          const animation12 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          animation7.translateX('-150px').step();
          animation12.translateX('150px').step();
          that.setData({
            animationData7: animation7.export(),
            animationData12: animation12.export(),
          })
        }, 100)
        // 基本信息身高动画
        setTimeout(function() {
          const animation8 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          const animation13 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          animation8.translateX('-150px').step();
          animation13.translateX('150px').step();
          that.setData({
            animationData8: animation8.export(),
            animationData13: animation13.export(),
          })
        }, 200)
        // 基本信息职业动画
        setTimeout(function() {
          const animation9 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          const animation14 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          animation9.translateX('-150px').step();
          animation14.translateX('150px').step();
          that.setData({
            animationData9: animation9.export(),
            animationData14: animation14.export(),
          })
        }, 300)
        // 基本信息地址动画
        setTimeout(function() {
          const animation10 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          const animation15 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          animation10.translateX('-150px').step();
          animation15.translateX('150px').step();
          that.setData({
            animationData10: animation10.export(),
            animationData15: animation15.export(),
          })
        }, 400)
        // 基本信息消失动画完毕隐藏基本消息内容
        setTimeout(function() {
          that.setData({
            twoBox5State: false,
            twoBox6State: true,
            animationIndex: 4
          })
          // 用户图片动画
          const animation16 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          const animation17 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          animation16.translateX('200px').step();
          animation17.translateX('-200px').step();
          that.setData({
            animationData16: animation16.export(),
            animationData17: animation17.export(),
          })
        }, 900)
        // 图片显示完毕左右按钮动画
        setTimeout(function() {
          that.setData({
            zyjtState: true
          })
          // 用户图片动画
          const animation18 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          const animation19 = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          })
          animation18.translateX('-80px').opacity(1).step();
          animation19.translateX('80px').opacity(1).step();
          that.setData({
            animationData18: animation18.export(),
            animationData19: animation19.export(),
          })
        }, 2300)
      }, 500)
    } else if (1 - ((that.data.twoClientY - clientY) / 50) <= 0 && that.data.animationIndex == 4) {
      that.onPullDownRefresh();
      console.log(that.data.animationIndex)
      const animation = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
      })
      const animation2 = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
      })
      const animation3 = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
      })
      const animation5 = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
      })
      const animation16 = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
      })
      const animation17 = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
      })
      const animation18 = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
      })
      const animation19 = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
      })
      animation.opacity(0).step()
      animation2.translateX('-100px').step()
      animation3.translateX('100px').step()
      animation5.translateX('400px').step();
      animation16.translateX('-200px').step();
      animation17.translateX('200px').step();
      animation18.translateX('80px').opacity(0).step();
      animation19.translateX('-80px').opacity(0).step();
      that.setData({
        tab: 2,
        animationIndex: 1,
        twoBox6State: false,
        twoBox5State: false,
        twoBox4State: false,
        animationData: animation,
        animationData2: animation2,
        animationData3: animation3,
        animationData5: animation5,
        animationData16: animation16,
        animationData17: animation17,
        animationData18: animation18,
        animationData19: animation19,
      })
    } else if (that.data.twoBox6State) {
      if (that.data.twoClientX - clientX < -50) {
        that.toLiao(that.data.msgData[1])
      } else if (that.data.twoClientX - clientX > 50) {
        that.toLiao(that.data.msgData[0])
      }
    }
  },
  clickBoxL(res){
    var that = this;
    console.log("66666")
    that.toLiao(that.data.msgData[0])
  },
  clickBoxR(res) {
    var that = this;
    that.toLiao(that.data.msgData[1])
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    that.setData({
      ifUpto: true
    })
    // that.yqPop();
    // that.closeAll();
    app.globalData.is_at_chat = false;
    if (app.globalData.isUserId) {
      // 获取地理位置
      that.getLocation();
      fn.http({
        param: {
          func: "user.me",
          user_id: app.globalData.user_id
        },
        success: function(res) {
          app.globalData.server = res.server;
          that.yqPop();
        }
      })

    }
    // 年龄数据
    var ageData = [];
    for (var i = 2000; i >= 1950; i--) {
      ageData.push(i)
    }
    that.setData({
      ageData: ageData
    })
    //省份数据
    var multiArray = [];
    var sheng = [];
    fn.http({
      param: {
        func: 'user.getprovince'
      },
      success: function(res) {
        for (var i in res.data) {
          multiArray.push(res.data[i].name);
        }
        that.setData({
          multiArray: multiArray,
          address: multiArray[0]
        })
      }
    })

    // that.getLocation();
    // 刷新vip
    // setTimeout(function(){
    //   that.is_vip();
    // },1000*60*2)
  },
  // 获取地理位置
  getLocation: function(res) {
    var that = this;
    return false
    // 获取位置
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
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
          success: function(res) {
            console.log(res);
            wx.hideLoading();
            that.setData({
              city: res.city,
              zhezhao: false
            })
          }
        })
      },
      fail: function(res) {
        wx.showModal({
          title: '提示',
          content: "请授权地理位置后使用",
          showCancel: false,
          success: function(res) {
            wx.openSetting({})
          }
        })
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
  // 是否是新用户
  checkIsNew(res) {
    var that = this;
    wx.getStorage({
      key: 'is_new',
      success(res) {
        if (res.data) {
          that.getSjStory();
          that.setData({
            aqxyState: true
          })
        }
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var that = this;
    // console.log(that.data.tab)
    // if (that.data.tab == 1) {
    //   var param = { func: "chat.getNowTempletList" }
    // } else {
    //   var param = { func: "chat.getNowTempletList", city: that.data.city }
    // }
    that.setData({
      gsPage: that.data.gsPage + 1,
      xiala: true
    }, function() {
      that.getIndexData();
      // wx.reLaunch({
      //   url: '../index/index',
      // })
    })
    return false
    // that.data.getIndexData();
    fn.http({
      param: param,
      success: function(res) {
        var newData = res;
        var oldData = that.data.msgData;
        var data = that.array_diff(newData, oldData); //去重后的新数组
        that.setData({
          msgData: data.concat(oldData)
        })
        wx.stopPullDownRefresh(); //停止页面刷新
      }
    })
  },
  array_diff: function(a, b) {
    for (var i = 0; i < b.length; i++) {
      for (var j = 0; j < a.length; j++) {
        if (a[j].m_id == b[i].m_id) {
          a.splice(j, 1);
          j = j - 1;
        }
      }
    }
    return a;
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    return false
    var that = this;
    that.setData({
      gsPage: that.data.gsPage + 1,
      bottomSpace: false
    }, function() {
      that.getIndexData();
      if (wx.pageScrollTo) {
        wx.pageScrollTo({
          scrollTop: 0
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，暂无法使用该功能，请升级后重试。'
        })
      }
      // wx.pageScrollTo({
      //   scrollTop: 0
      // })
    })
    return false

  },
  bindscrolltolowe(res) {

  },
  bindscrolltoupper(res) {
    console.log("出顶了")
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    var that = this;
    wx.showShareMenu({
      withShareTicket: true
    })
    return {
      title: app.globalData.shareData.share_msg,
      path: '/pages/index/index?friend_u_id=' + app.globalData.user_id,
      imageUrl: app.globalData.shareData.share_img,
      success: function(res) {
        console.log(res)
      }
    }
    return false
    if (res.from == "button") {
      wx.showShareMenu({
        withShareTicket: true
      })
      return {
        title: "静聊",
        path: "/pages/logs/logs",
        success: function(res) {
          fn.http({
            param: {
              func: "user.addShareLog",
              user_id: app.globalData.user_id
            },
            success: function(res) {
              that.is_vip();
            }
          })
        }
      }
    }
  },
  // 判断是否是VIP
  is_vip: function(res) {
    var that = this;
    fn.http({
      param: {
        func: "user.isVip",
        user_id: app.globalData.user_id
      },
      success: function(res) {}
    })
  },
  // 性别选择
  bindPickerChange: function(e) {
    this.setData({
      sexIndex: e.detail.value
    })
    console.log(this.data.sexIndex)
  },
  // 生日
  bindinputAge(e) {
    var that = this;
    this.setData({
      age: that.data.ageData[e.detail.value]
    })
    console.log(this.data.age)
  },
  // 身高
  bindinputHeight(e) {
    this.setData({
      userHeight: e.detail.value
    })
    console.log(this.data.userHeight)
  },
  // 家乡
  bindinputAddress(e) {
    var that = this;
    this.setData({
      multiIndex: e.detail.value,
      address: that.data.multiArray[e.detail.value]
    })
    console.log(that.data.multiArray[e.detail.value])
  },
  // // 姓名
  // bindinputName(e) {
  //   this.setData({
  //     zcName: e.detail.value
  //   })
  //   console.log(this.data.zcName)
  // },
  // 学历
  xlChange(res) {
    this.setData({
      xlIndex: res.detail.value
    })
    console.log(res.detail.value)
  },
  // 行业
  bindinputIndustry(e) {
    this.setData({
      industry: e.detail.value
    })
    console.log(this.data.industry)
  },
  // 薪资
  xzChange(res) {
    this.setData({
      xzIndex: res.detail.value
    })
    console.log(res.detail.value)
  },
  // 房车
  fcChange(res) {
    this.setData({
      fcIndex: res.detail.value
    })
    console.log(res.detail.value)
  },
  // 获取手机号
  bindgetphonenumber(e) {
    var that = this;
    console.log(e)
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
  },
  // 基本信息注册
  toTab3(res) {
    var that = this;
    if (that.data.userHeight && that.data.industry) {
      fn.http({
        param: {
          func: 'user.register',
          user_id: app.globalData.user_id,
          // gender: that.data.sexIndex==0?1:2,
          industry: that.data.industry,
          year: that.data.age,
          height: that.data.userHeight,
          address: that.data.address,
        },
        success: function(res) {
          app.getUserMsg();
          that.setData({
            popS1Box: false,
            zhezhao: false
          })
          var msglist = that.data.msglist
          if (that.data.msglist) {
            fn.http({
              param: {
                func: "user.addChat",
                from_user_id: app.globalData.user_id,
                m_id: msglist.m_id,
                to_user_id: msglist.user_id
              },
              success: function(res) {
                app.globalData.chatData = msglist;
                wx.navigateTo({
                  url: '../chat/chat'
                })
              }
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
  // 隐私信息注册
  toTab4(res) {
    var that = this;
    if (that.data.xlIndex != 0 && that.data.xzIndex != 0) {
      fn.http({
        param: {
          func: 'user.userInfoRegister',
          user_id: app.globalData.user_id,
          educate: that.data.xlIndex,
          salary: that.data.xzIndex,
          touringcar: that.data.fcIndex - 0 + 1,
          // industry: that.data.industry
        },
        success: function(res) {
          app.getUserMsg();
          that.setData({
            popS2Box: false,
            zhezhao: false
          })
          var msglist = that.data.msglist
          if (that.data.msglist) {
            fn.http({
              param: {
                func: "user.addChat",
                from_user_id: app.globalData.user_id,
                m_id: msglist.m_id,
                to_user_id: msglist.user_id
              },
              success: function(res) {
                app.globalData.chatData = msglist;
                wx.navigateTo({
                  url: '../chat/chat'
                })
              }
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
  // 获取首页消息
  getIndexData: function(res) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var param = {
      func: "chat.getNowTempletList",
      user_id: app.globalData.user_id,
      gender: app.globalData.gender,
      page: that.data.gsPage
    };
    fn.http({
      param: param,
      success: function(res) {
        that.againAnimation();
        wx.hideLoading();
        if (res != "") {
          wx.stopPullDownRefresh(); //停止页面刷新
          that.setData({
            msgData: res,
            zhezhao: false,
            is_loading: false,
          })
          // 检查用户是否是新用户
          // that.checkIsNew();
          setTimeout(function() {
            that.setData({
              bottomSpace: true
            })
          }, 1500)
        } else {
          console.log("执行这里了")
          that.setData({
            gsPage: 0
          })
          that.getIndexData();
        }
        return false;
        if (1) {} else if (!that.data.online_unline && res == "") {
          wx.stopPullDownRefresh(); //停止页面刷新
          that.setData({
            gsPage: that.data.gsPage - 0 - 1
          })
          return false
        } else if (that.data.online_unline && res == "") {
          that.setData({
            gsPage: 1,
            online_unline: false,
            zhezhao: false
          }, function() {
            that.getIndexData();
          })
        } else {
          console.log("执行这里了")
          that.getIndexData();
        }
        wx.stopPullDownRefresh(); //停止页面刷新
      }
    })
  },
  // 点击滚动字体
  doommList: function(res) {
    var idx = res.currentTarget.dataset.idx;
    console.log(idx)
  },
  // 点击修改
  compile: function(res) {
    var that = this;
    var listData = res.currentTarget.dataset;
    that.setData({
      list_idx: listData.idx,
      list_t_content: listData.t_content,
      list_t_id: listData.t_id
    })
  },
  // 失去焦点修改模板消息
  bindblur: function(res) {
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
      success: function(res) {
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
  // 点击添加编辑故事
  addMuban(res) {
    var that = this;
    var type = res.currentTarget.dataset.type; //编辑1 增加2
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
            param: {
              func: "chat.deltemp",
              t_id: that.data.bjStoryData.t_id
            },
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
  // 获取用户消息模板
  getTempletList: function() {
    fn.http({
      param: {
        func: "chat.getTempletList",
        user_id: app.globalData.user_id
      },
      success: res => {
        console.log(res);
        this.setData({
          TempletList: res
        })
      }
    })
  },
  // input输入
  chatBindinput: function(res) {
    var that = this;
    var val = res.detail.value;
    if (!val) {
      that.setData({
        chatValue: ""
      })
    } else {
      that.setData({
        chatValue: val
      })
    }
  },
  // 套路输入
  mubanSave: function(res) {
    var that = this;
    var val = res.detail.value;
    that.setData({
      temTextAreaValue: val
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
        aqxyState: false
      })
    }
  },
  // 套路失去焦点
  textareaBlur: function(res) {
    var that = this;
    var val = res.detail.value;
    if (val == "") {
      that.setData({
        bottomTextArea: true
      })
    }
  },
  // 落入焦点
  bindfocus(res) {
    var that = this;
    that.setData({
      infocus: false
    })
  },
  // 添加故事
  confirmBtn: function(res) {
    var that = this;
    var new_content = that.data.temTextAreaValue;
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
        func: "chat.addTemplet",
        user_id: app.globalData.user_id,
        t_content: new_content,
        gender: app.globalData.gender
      },
      success: function(res) { //添加模板消息成功
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
  //底部显示隐藏
  addBtn: function(res) {
    var that = this;
    that.setData({
      zhezhao: true,
      bottomState: !that.data.bottomState
    })
  },
  random: function() {
    var random = Math.floor(Math.random() * 10);
    console.log(random)
    return random;
  },
  bindbt: function() {
    console.log(1)
    const that = this;
    const {
      msgData
    } = that.data;
    // console.log(msgData);
    // that.setData({
    //   msgData: [
    //     { msg: "111111111111" },
    //     { msg: "22222222222222" },
    //     { msg: "3333333333333" },
    //     { msg: "4444444444444" },
    //     { msg: "55555555555555" },
    //     { msg: "666666666666666666" },
    //     { msg: "77777777777777" },
    //     { msg: "88888888888888" },
    //     { msg: "9999999999999999" }
    //   ]
    // })
    const longth = msgData.length + 1;
    const obj = {
      content: `999999999999999${longth}00000`,
      time: msgData[0].time,
      color: getRandomColor()
    };
    console.log(obj)
    msgData.splice(i % msgData.length, 0, obj)
    console.log(msgData)
    that.setData({
      msgData,
      isChangeBarrage: true
    })
  },
  //设置动画运动的时间  
  change: function(data) {
    var that = this;
    return data.map((item, index) => {
      item.time = 5;
      return item
    })
  },
  // 发送故事
  sendStory(res) {
    var that = this;
    fn.http({
      param: {
        func: "chat.updTemplet",
        user_id: app.globalData.user_id,
        t_id: that.data.sjStory.t_id,
        t_content: that.data.sjStory.t_content
      },
      success: function(res) {
        that.setData({
          aqxyState: false
        })
        wx.switchTab({
          url: '../red/red',
        })
      }
    })
  },
  // 获取随机故事
  getSjStory(res) {
    var that = this;
    fn.http({
      param: {
        func: "chat.getrandtemplet",
        gender: 1,
        user_id: app.globalData.user_id
      },
      success: function(res) {
        that.setData({
          sjStory: res
        })
        wx.clearStorage()
      }
    })
  },
  //点击举报故事
  jbBtn(res) {
    var that = this;
    var t_id = res.currentTarget.dataset.t_id;
    var to_user_id = res.currentTarget.dataset.user_id;
    wx.showModal({
      title: '提示',
      content: '是否举报该用户',
      success(res) {
        if (res.confirm) {
          fn.http({
            param: {
              func: "report.chatTemplet",
              from_user_id: app.globalData.user_id,
              to_user_id: to_user_id,
              reason: "举报不需要理由",
              t_id: t_id
            },
            success: function(res) {
              console.log("举报成功")
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  setBarrage: function(msgListName) {
    const that = this;
    const {
      isChangeBarrage,
      msgData
    } = that.data;

    // let _newData = that.change(msgData);
    let _newData = that.data.msgData

    //判断是否有新的数据加入  
    if (isChangeBarrage) {
      that.setData({
        isChangeBarrage: !isChangeBarrage
      })
    }
    // console.log(index)
    index = index >= _newData.length ? index - _newData.length : index;
    if (msgListName == "topMsg") {
      topMsgList.push(new Doomm(_newData[index].content, _newData[index].time, msgListName, _newData[index].idx, that));
      that.setData({
        topMsg: topMsgList,
        scrollTop: that.data.scrollTop - 0 + 100
      });
      // console.log(that.data.topMsg)
    }
    // else if (msgListName == "bottomMsg2") {
    //   bottomMsgList2.push(new Doomm(_newData[index].msg, _newData[index].time, msgListName, _newData[index].idx, that));
    //   that.setData({
    //     bottomMsg2: bottomMsgList2
    //   })
    // } else {
    //   bottomMsgList.push(new Doomm(_newData[index].msg, _newData[index].time, msgListName, _newData[index].idx, that));
    //   that.setData({
    //     bottomMsg: bottomMsgList
    //   })
    // }
    index++;
  },
  // 滚动事件
  scrolltolower: function(res) {
    // console.log("666")
  }

})

function getRandomColor() {
  let rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  // console.log(rgb)
  return '#' + rgb.join('')

}
class Doomm {
  constructor(text, time, msgListName, idx, page) {
    this.text = text;
    this.time = time;
    this.color = getRandomColor();
    this.idx = idx;
    let that = this;
    this.id = i++;
    setTimeout(function() {
      delList(msgListName, that, page)
    }, time * 1000) //定时器动画完成后执行。  

    function delList(msgListName, that) {
      if (topMsgList.length > 10) {
        // console.log(topMsgList.indexOf(that))
        topMsgList.splice(0, 1); //动画完成，从列表中移除这项  
        page.setData({
          topMsg: topMsgList
        })
      }
      // else if (msgListName == "bottomMsg2") {
      //   bottomMsgList2.splice(bottomMsgList2.indexOf(that), 1);//动画完成，从列表中移除这项  
      //   page.setData({
      //     bottomMsg2: bottomMsgList2
      //   })
      // } else {
      //   bottomMsgList.splice(bottomMsgList.indexOf(that), 1);//动画完成，从列表中移除这项  
      //   page.setData({
      //     bottomMsg: bottomMsgList
      //   })
      // }
    }
  }
}