// pages/chat/chat.js
const util = require('../../utils/util.js');
const fn = require('../../utils/function.js');
var dt = require('../../utils/dt.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Day_once:true,
    photoState: false,
    // to_user_id: 123,
    msg: [],
    recordState:false,
    start_end: false,
    bottomTextArea: true,//添加套路状态
    chatValue: null,//聊天输入框默认为空
    giftState:1,
    // giftClickIndex:1,
    location:false,//查看位置
    bottomHintText:false,//消耗魅力值提示
    errorState: false,
    vipState:false,//魅力值不足弹窗
    isHasKeyboard:false,
    ceyy:'http://shangxuejin.video.cdn.liunianshiguang.com/u…ads/20180809/0a8f82eb3982ab07f4ae33c053dc3269.mp3',
    is_playing:false,
    shadeState:false,
    giftPopState:false,//礼物弹窗
    giftIndex:0,
    bmf:null,
    isLoad:false,
    ageIndex: 8,
    age: 1992,
    userHeight: 168,
    multiIndex: 0,
    uploadState:0,
    xz: ['收入', '1000~5000', '5000~10000', '10000~20000', '20000以上'],
    xzIndex: 0,
    fc: ['无车无房', '无车有房', '有车无房', '有车有房'],
    fcIndex: 0,
    xl: ['学历', '高中及以下', '专科', '本科', '硕士', '博士及以下'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.data){
      var userData = JSON.parse(options.data);
    }else{
      var userData = app.globalData.chatData;
    }
    
    console.log(userData)
    console.log("上面是带进来的参数")
    var that = this;
    var sis = wx.getSystemInfoSync();
    // 自定义导航栏高度
    let height;
    height = 64
    if (sis.model == 'iPhone X') {
      height = 88
    }
    if (sis.platform == 'android') {
      height = 72
    }
    that.setData({
      height: height + 'px',
      height2: height,
      _h: sis.screenHeight - height + 'px',
      _w: sis.screenWidth
    })
    app.globalData.headerHeight = height + 'px';
    app.globalData.headerHeight2 = height;
    app.globalData.allHeight = height - sis.statusBarHeight + 'px';
    app.globalData.statusBarHeight = sis.statusBarHeight;
    app.globalData.topHeight = sis.statusBarHeight + 20 + 'px';
    app.getUserOpenId().then(function(){
      console.log(options)
      that.setData({
        topHeight: app.globalData.topHeight,
        myself_id: app.globalData.user_id,
        userData: userData,
        to_user_id: userData.user_id ? userData.user_id : userData.from_user_id,
        headerHeight: app.globalData.headerHeight,
        allHeight: app.globalData.allHeight,
        headerHeight2: app.globalData.headerHeight2,
        inType: userData.inType==1 ? true : false
      })
      var timeDate = new Date();
      var nowDay = timeDate.getDate();
      const day_once = wx.getStorageSync('day_once')
      if (day_once && day_once == nowDay){
        that.setData({
          day_once: false
        })
      }else{
        wx.setStorage({
          key: 'day_once',
          data: nowDay
        })
        that.setData({
          day_once:true
        })
      }
      wx.getStorage({
        key: 'day_once',
        success(res) {
          console.log(res.data)
        },file(res){
          console.log("失败了")
        }
      })
      // 检测对方是否拉黑
      that.checkBlack(that.data.to_user_id)
      // 检测是否是VIP
      // that.is_vip();
      // 获取对方用户信息
      that.oppositeUser();
      console.log(userData)
      // 获取用户消息模板
      that.getTempletList();
      if (that.data.inType) {
        that.getPLP();
      } else {
        // 获取最后几条信息
        that.getLastMsg();
      }
      if (!app.globalData.socketonLine) {
        // socket
        that.socket();
      }
      that.getGift();
      that.checkUserMsg();
    })
    
  },
  // 获取最后几条信息
  getLastMsg(res){
    var that = this;
    var data2 = {};
    data2.from_user_id = that.data.to_user_id;
    fn.http({
      param: { func: "chat.chat_log", user_id: app.globalData.user_id,to_user_id: that.data.to_user_id },
      success: function (res) {
        that.setData({
          msg:res.data
        });
        that.readMessages(data2);
      }
    })
  },
  // 获取漂流瓶故事
  getPLP(res) {
    var that = this;
    fn.http({
      param: { func: "chat.getTempletList", user_id: that.data.to_user_id },
      success: res => {
        console.log(res[0])
        var plpData = {};
        plpData.from_user_id = that.data.to_user_id;
        plpData.to_user_id = app.globalData.user_id;
        plpData.file_type = 1;
        plpData.type = "say";
        plpData.content = res[0].t_content;
        console.log(plpData)
        var newD = [];
        newD[0] = plpData
        // return false
        that.setData({
          msg: newD,
          isLoad: true
          // aqxyState: true,
          // TempletList: res
        })
      }
    })

  },
  // 关闭弹窗
  close(res){
    this.setData({
      giftState:1
    })
  },
  // 去除相同
  array_diff: function (a, b) {
    //a是旧数据  b是新数据
    var that = this;
    return a;
    //delete1，delete2为true不可删除 反之删除
    if (!that.data.is_delete1) {
      for (var i = 0; i < b.length; i++) {
        for (var j = 0; j < a.length; j++) {
          if (a[j].from_user_id == app.globalData.user_id) {
            a.splice(j, 1);
            j = j - 1;
          }
        }
      }
    } else if (!that.data.is_delete2) {
      for (var i = 0; i < b.length; i++) {
        for (var j = 0; j < a.length; j++) {
          if (a[j].from_user_id == that.data.to_user_id) {
            a.splice(j, 1);
            j = j - 1;
          }
        }
      }
    }
    else {
      console.log("wuyong")
    }
    console.log(b[0].to_user_id, b[0].from_user_id);
    if (b[0].from_user_id == that.data.myself_id) {
      that.setData({
        is_delete1: true,
        is_delete2: false
      })
    } else if (b[0].from_user_id == that.data.to_user_id) {
      that.setData({
        is_delete1: false,
        is_delete2: true,
      })
    }
    else {
      that.setData({
        is_delete1: true,
        is_delete2: true
      })
    }
    console.log(that.data.is_delete1, that.data.is_delete2)//判断对方是否回复，回复删除自己之前的话
    return a;
    
  },
  // 切换gift
  tabGift(res){
    var that = this;
    that.setData({
      giftPopState: true,
      shadeState: true,
      // giftState:2
    })
  },
  clickGift(res){
    this.setData({
      giftClickIndex: res.currentTarget.dataset.idx,
      g_id: res.currentTarget.dataset.g_id
    })
  },
  // 报名费输入
  baomingfei(res){
    var that = this;
    that.setData({
      bmf: res.detail.value
    })
  },
  // 送礼物
  sendGift(res){
    var that = this;
    if(that.data.errorState){
      return false
    }
    if(that.data.bmf==null){
      wx.showModal({
        title: '提示',
        content: '请输入报名费',
        showCancel: false
      })
      return false
    }
    fn.http({
      param: { 
        func: "pay.placeOrder", 
        user_id: app.globalData.user_id, 
        g_id: that.data.gift_id, 
        send_to_user_id: that.data.to_user_id,
        total_fee: that.data.bmf
      },
      success: function (res) {
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
          success: function (res) {
            that.closeAll();
          },
          'fail': function (res) {
            console.log(res);
          }
        })
      }
    })
  },
  // 点击加号
  addBtn: function (res) {
    var that = this;
    that.setData({
      photoState: !that.data.photoState
    })
  },
  // 发送消息
  bindconfirm: function (res) {
    var that = this;
    if(that.data.errorState){
      return false
    }
    var chatValue = res.detail.value;
    var data = '{"type":"' + "say" + '","user_id":"' + app.globalData.user_id + '","to_user_id":"' + that.data.to_user_id + '","content":"' + chatValue + '"}';
    // console.log(data)
    if(chatValue){//空消息不允许发送
      fn.http({
        param: { func: "chat.chat", user_id: app.globalData.user_id, to_user_id: that.data.to_user_id, content: chatValue },
        success: function (res) {
          if (res.code == "-100018" || res.code == "-100021" || res.code == "-100030"){
            wx.showModal({
              title: '提示',
              content: res.msg,
              showCancel: false
            })
          }
          that.setData({
            chatValue: "",
            chatIntoView:'chat'+66
          })
        }
      })
      return false
      wx.sendSocketMessage({
        data: data,
        success: function (res) {
          that.setData({
            chatValue:""
          })
          console.log(res);
        }
      })
    }
  },
  // 发送图片
  chooseImg: function (res) {
    var that = this;
    if (that.data.errorState) {
      return false
    }
    // if(!that.data.is_vip){
    //   that.setData({
    //     vipState : true
    //   })
    //   return
    // }
    // fn.http({
    //   param: { func: "chat.uploadFile", user_id: app.globalData.user_id,to_user_id: app.globalData.user_id },
    //   success: function (res) {
    //     console.log(res);
    //   }
    // })
    // return false
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        console.log(res);
        var tempFilePaths = res.tempFilePaths[0];
        console.log(tempFilePaths)
        var imgData = {
          func: "chat.sendImg",
          file: tempFilePaths,
          user_id: app.globalData.user_id,
          to_user_id: that.data.to_user_id
        }
        wx.uploadFile({
          url: app.globalData.txUrl,
          filePath: tempFilePaths,
          name: 'file',
          method: 'POST',
          formData: dt.makeMd5Par(imgData),
          success: res => {
            console.log(res.data);
            if (res.data == '{"code":-100019,"msg":"魅力值不足"}' || res.data =='{"code":-100028,"msg":"vip才可以发送语音和图片"}'){
              that.setData({
                vipState: true
              })
            }else{
              console.log("执行这里")
            }
          }
        })
      }
    })
  },
  // 发送语音
  record: function (res) {
    var that = this;
    if (that.data.errorState) {
      return false
    }
    wx.getSetting({
      success(res) {
        console.log(res);
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              wx.startRecord()
            },fail(){
              wx.showModal({
                title: '提示',
                content: '请授权后使用语音功能',
                showCancel:false,
                success(res){
                  if (res.confirm){
                    wx.openSetting({
                      
                    })
                  }
                }
              })
              console.log("用户拒绝授权了")
            }
          })
        }else{
          that.setData({
            recordState: !that.data.recordState
          })
          
        }
      }
    })
  },
  start:function(res){
    var that = this;
    var recorderManager = that.recorderManager;
    that.setData({
      start_end:true
    })
    console.log("按住了")
    const options = {
      duration: 10000,//指定录音的时长，单位 ms
      sampleRate: 16000,//采样率
      numberOfChannels: 1,//录音通道数
      encodeBitRate: 96000,//编码码率
      format: 'mp3',//音频格式，有效值 aac/mp3
      frameSize: 50,//指定帧大小，单位 KB
    }
    //开始录音
    recorderManager.start(options);
    recorderManager.onStart(() => {
      console.log('recorder start')
    });
    //错误回调
    recorderManager.onError((res) => {
      console.log(res);
    })
  },
  // 录音结束发送
  end:function(res){
    var that = this;
    var recorderManager = that.recorderManager;
    that.setData({
      start_end: false
    }) 
    recorderManager.stop();
    recorderManager.onStop((res) => {
      this.tempFilePath = res.tempFilePath;
      console.log('停止录音', res.tempFilePath)
      const { tempFilePath } = res;

      var recordData = {
        func: "chat.sendSound",
        file: tempFilePath,
        user_id: app.globalData.user_id,
        to_user_id: that.data.to_user_id
      }
      wx.uploadFile({
        url: app.globalData.txUrl,
        filePath: tempFilePath,
        name: 'file',
        method: 'POST',
        formData: dt.makeMd5Par(recordData),
        success: res => {
          if (res.data == '{"code":-100019,"msg":"魅力值不足"}' || res.data == '{"code":-100028,"msg":"vip才可以发送语音和图片"}') {
            that.setData({
              vipState: true
            })
          } else {
            console.log("执行这里")
          }
        }
      })
    })
  },
  // 图片点击放大
  seeFunImg: function (res) {
    var that = this;
    var imgUrl = String(res.currentTarget.dataset.imgurl);
    wx.previewImage({
      current: imgUrl, // 当前显示图片的http链接
      urls: [imgUrl] // 需要预览的图片http链接列表
    })
    // that.setData({
    //   lookImg: true
    // })
  },
  play:function(res){
    var that = this;
    // innerAudioContext.destroy()
    var record = res.currentTarget.dataset.recordurl;
    var innerAudioContext = that.data.innerAudioContext;
    console.log(record)
    innerAudioContext.stop();
    setTimeout(function(){
      innerAudioContext.src = record;
      innerAudioContext.play();
    },100)
  },
  //底部显示隐藏
  template: function (res) {
    var that = this;
    that.setData({
      bottomState: !that.data.bottomState
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
// 爱情宣言
  aqxy(res){
    var that = this;
    fn.http({
      param: { func: "chat.getTempletList", user_id: that.data.to_user_id },
      success: res => {
        this.setData({
          aqxyState:true,
          TempletList: res
        })
      }
    })
  },
  //点击举报故事
  jbBtn(res){
    var that = this;
    var t_id = res.currentTarget.dataset.t_id;
    wx.showModal({
      title: '提示',
      content: '是否举报该用户',
      success(res) {
        if (res.confirm) {
          fn.http({
            param: { func: "report.chatTemplet", from_user_id: app.globalData.user_id, to_user_id: that.data.to_user_id, reason: "举报不需要理由",t_id:t_id},
            success: function (res) {
              console.log("举报成功")
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  // 点赞故事
  dzBtn(res){
    var that = this;
    var t_id = res.currentTarget.dataset.t_id;
    fn.http({
      param: { func: "chat.thumbup", t_id: t_id ,user_id:app.globalData.user_id},
      success: function (res) {
        console.log(res)
        that.aqxy();
      }
    })
  },
  // 点击举报聊天消息
  reportBtn: function (res) {
    var that = this;
    var to_user_id = res.currentTarget.dataset.to_user_id;//被举报人ID
    var content = res.currentTarget.dataset.content;//举报的模板ID
    // return false
    wx.showModal({
      title: '提示',
      content: '是否举报该用户',
      success(res) {
        if (res.confirm) {
          fn.http({
            param: { func: "report.chatMessage", from_user_id: app.globalData.user_id, to_user_id: to_user_id, reason: "举报不需要理由", content: content },
            success: function (res) {
              console.log("举报成功")
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  // 用户对方个人信息
  oppositeUser(res){
    var that = this;
    fn.http({
      param: { func: "user.me", user_id: that.data.to_user_id },
      success: function (res) {
        var userMyself = res.userinfo;
        that.setData({
          oppositeData: userMyself,
          userMyself: app.globalData.userMyself
        })
      }
    })
  },
  // 检测用户是否填写信息
  checkUserMsg(res){
    var that = this;
    if (!app.globalData.height) {
      that.setData({
        zhezhao: true,
        popS1Box: true
      })
    } else if (!app.globalData.touringcar){
      that.setData({
        zhezhao: true,
        popS2Box: true
      })
    }
    // 年龄数据
    var ageData = [];
    for (var i = 2000; i >= 1950; i--) {
      ageData.push(i)
    }
    that.setData({ ageData: ageData })
    //省份数据
    var multiArray = [];
    var sheng = [];
    fn.http({
      param: { func: 'user.getprovince' },
      success: function (res) {
        for (var i in res.data) {
          multiArray.push(res.data[i].name);
        }
        that.setData({
          multiArray: multiArray,
          address: multiArray[0]
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    app.globalData.is_at_chat = true;
    that.setData({ isAtChat : true})
    that.recorderManager = wx.getRecorderManager();
    that.innerAudioContext = wx.createInnerAudioContext();
    // 截屏事件
    wx.onUserCaptureScreen(function (res) {
      if (app.globalData.is_at_chat){
        fn.http({
          param: { func: "user.prohibitSeal", user_id: app.globalData.user_id },
          success: function (res) {
            wx.reLaunch({
              url: '../logs/logs?is_lock=1',
            })
          }
        })
      }else{
        console.log("没在当前页面")
        return false
      }
      
    })
    const innerAudioContext = wx.createInnerAudioContext();
    that.setData({
      innerAudioContext: innerAudioContext
    })
    // 链接关闭
    wx.onSocketClose(function () {
      console.log("链接关闭了")
      app.globalData.socketonLine = false;
      if (that.data.isAtChat){
        // that.socket();
      }
    })
    // 接受数据
    wx.onSocketMessage(function (data) {
      var data2 = JSON.parse(data.data);
      console.log(data2)
      switch (data2.type) {
        case 'send_message':
          break;
        case 'ping':
          console.log("呼吸")
          break;
        case 'close':
          that.setData({
            hintText: "对方离开聊天室",
            errorState: true,
          })
          break;
        case 'say':
          if (that.data.errorState) {
            return
          } else {
            console.log(data2)
            if(data2.from_user_id!=app.globalData.user_id){
              that.readMessages(data2);
            }
            if (data2.from_user_id == that.data.to_user_id || data2.to_user_id == that.data.to_user_id) {
              var oldData = that.data.msg;
              var newData = [];
              newData[0] = data2;
              if(!oldData){
                that.setData({
                  msg: newData
                })
              }else{
                that.setData({
                  msg: oldData.concat(newData)
                })
              }
              
              return false
              var data = that.array_diff(oldData, newData);//去重后的新数组
              that.setData({
                msg: data.concat(newData)
              })
            }
          }
          break;
        case 'gift':
          if (that.data.errorState) {
            return false
          } else {
            console.log(data2)
            console.log(that.data.is_delete)
            var newData = [];
            newData[0] = data2;
            var oldData = that.data.msg;
            var data = that.array_diff(oldData, newData);//去重后的新数组
            that.setData({
              msg: oldData.concat(newData)
            })
          }
          break;
        case 'note':
          // var redData = app.globalData.redData;
          // app.globalData.redData.push(data2);
          // app.globalData.redData = app.unique(app.globalData.redData)
          break;
        default:
          console.log("执行")
          break;
      }
    })
  },
  // socket
  socket(res){
    var that = this;
    //建立连接
    wx.connectSocket({
      url: "wss://socket.shangxuejin.com/wss",
    })
    //连接成功
    wx.onSocketOpen(function () {
      var data = '{"type":"' + "login" + '","user_id":"' + app.globalData.user_id + '"}';
      app.globalData.is_login = true,
        wx.sendSocketMessage({
          data: data,
          success: function (res) {
            console.log("链接成功了")
            app.globalData.socketonLine = true//标识已经链接
            return false
            if (app.globalData.chatData.inType == 6) {
              console.log("执行这里")
              fn.http({
                param: { func: "chat.chat", user_id: app.globalData.user_id, to_user_id: that.data.to_user_id, content: "我觉得TA不错，求红娘牵线" },
                success: function (res) {
                }
              })
            }
          }
        })
    })
  },
  // 已读标识
  readMessages(res){
    var that = this;
    fn.http({
      param: { func: "chat.read_message", user_id: app.globalData.user_id, from_user_id: that.data.to_user_id },
      success: function (res) {
        console.log("已读消息成功")
        that.setData({
          isLoad:true
        })
      }
    })
  },
  // 礼物选择
  bindGiftChange(res){
    var that = this;
    console.log(res.detail.value);
    that.setData({
      giftIndex: res.detail.value,
      gift_id: that.data.giftIndexData[res.detail.value]

    })
  },
  // 获取gift列表
  getGift(res){
    var that = this;
    fn.http({
      param: { func: "chat.getGift", user_id: app.globalData.user_id },
      success: function (res) {
        var giftData=[];
        var giftIndexData=[];
        for(var i in res.data){
          giftData.push(res.data[i].g_name);
          giftIndexData.push(res.data[i].g_id);
        }
        that.setData({
          giftData: giftData,
          giftIndexData: giftIndexData,
          gift_id: giftIndexData[0],
          giftList:res.data,
          g_id: res.data[0].g_id
        })
        console.log(that.data.giftData)
      }
    })
  },
  // 关闭所有弹窗
  closeAll(res){
    var that = this;
    that.setData({
      giftPopState:false,
      shadeState: false,
      aqxyState:false,
      giftState: 1
    })
  },
  // 检测是否拉黑
  checkBlack(to_user_id){
    var that = this;
    fn.http({
      param: { func: "user.checkBlack", user_id: app.globalData.user_id, to_user_id: to_user_id},
      success: function (res) {
        that.setData({
          is_black : res.is_black
        })
      }
    })
  },
  // 判断是否是VIP
  is_vip: function (res) {
    var that = this;
    fn.http({
      param: { func: "user.isVip", user_id: app.globalData.user_id },
      success: function (res) {
        if(res.code!=0){
          that.setData({ is_vip : false})
        }else{
          that.setData({ is_vip: true })
        }
      }
    })
  },
  // 取消拉黑
  quBlack(res){
    var that = this;
    fn.http({
      param: { func: "user.unPullBlack", user_id: app.globalData.user_id, un_pull_black_user_id: that.data.to_user_id },
      success: function (res) {
        console.log("用户拉黑，掉接口成功")
        // 检测是否拉黑
        that.checkBlack(that.data.to_user_id)
        that.setData({
          errorState: false
        })
      }
    })
  },
  // 查位置
  location(res){
    var that = this;
    wx.showModal({
      title: '提示',
      content: '查看位置需要消耗 1 点魅力值',
      success(res) {
        if (res.confirm) {
          fn.http({
            param: { func: "user.queryLocation", user_id: app.globalData.user_id, query_user_id: that.data.to_user_id, lat: app.globalData.latitude, lon: app.globalData.longitude },
            success: function (res) {
              console.log(res)
              if (res.code == "-100019") {
                wx.showModal({
                  title: '提示',
                  content: res.msg,
                  showCancel: false
                })
              } else {
                that.setData({
                  location: true,
                  giftState: 1,
                  bottomHintText: true,
                  chatUserCity: res.city,
                  chatUserDistance: res.distance,

                })
                setTimeout(function () {
                  that.setData({
                    bottomHintText: false,
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
  // 拉黑
  pullBlack(res){
    var that = this;
    // wx.onUserCaptureScreen(function (res) {
      fn.http({
        param: { func: "user.pullBlack", user_id: app.globalData.user_id, pull_black_user_id: that.data.to_user_id },
        success: function (res) {
          console.log("用户拉黑，掉接口成功")
          // 检测是否拉黑
          that.checkBlack(that.data.to_user_id)

          that.setData({
            hintText: "已把对方拉黑，不能发送消息",
            errorState:true
          })
        }
      })
    // })
  },
  // 关闭弹窗
  closePop(res){
    var that = this;
    that.setData({
      vipState : false
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
            that.is_vip();
            that.setData({
              vipState: false
            })
          },
          'fail': function (res) {
            console.log(res);
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var that = this;
    that.setData({ isAtChat: false})
    app.globalData.is_at_chat=false
  },
  // 退出
  backIndex(res){
    var that = this;
    wx.switchTab({
      url: '../index/index',
    })
    return false;
    // fn.http({
    //   param: { func: "user.closeSocket", to_user_id: that.data.to_user_id },
    //   success: function (res) {
    //     wx.redirectTo({
    //       url: '../index/index',
    //       success: function(res) {},
    //       fail: function(res) {},
    //       complete: function(res) {},
    //     })
    //   }
    // })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this;
    wx.closeSocket();
    that.setData({
      to_user_id:null,
      msg:[]
    })
    app.globalData.is_at_chat= false;
    // 记录离线时间
    // fn.http({
    //   param: { func: "user.leaveTime",user_id: app.globalData.user_id},
    //   success: function (res) {
    //     console.log(res);
    //   }
    // })
    
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
    var that = this;
    return {
      title: app.globalData.shareData.share_msg,
      path: '/pages/index/index?friend_u_id=' + app.globalData.user_id,
      imageUrl: app.globalData.shareData.share_img,
      success: function (res) {
        that.setData({
          vipState: false
        })
      }
    }
    return false
  },
  // 点击模板消息
  listClick: function (res) {
    var that = this;
    var listvalue = res.currentTarget.dataset.listvalue;
    var list_idx = res.currentTarget.dataset.list_idx;
    var idx = res.currentTarget.dataset.idx;
    if (list_idx != idx) {
      that.setData({
        chatValue: listvalue
      })
    }
  },
  // 点击修改
  compile: function (res) {
    var that = this;
    var listData = res.currentTarget.dataset;
    that.setData({
      list_idx: listData.idx,
      list_t_content: listData.t_content,
      list_t_id: listData.t_id
    })
  },
  // 失去焦点修改模板消息
  bindblur: function (res) {
    var that = this;
    var new_content = res.detail.value;
    fn.http({
      param: { func: "templet.updTemplet", t_id: that.data.list_t_id, t_content: new_content },
      success: function (res) {
        // 刷新模板消息
        that.getTempletList();
        that.setData({
          list_idx: null,
        })
      }
    })
  },
  // 输入框获取焦点
  bindfocus(res){
    var that = this;
    that.setData({
      keyboardHeight: res.detail.height +'px',
      isHasKeyboard : true
    })
  },
  bindblur(res){
    var that = this;
    that.setData({
      isHasKeyboard: false
    })
  },
  // 获取用户消息模板
  getTempletList: function () {
    var that = this;
    fn.http({
      param: { func: "chat.getTempletList", user_id: app.globalData.user_id },
      success: function (res) {
        that.setData({
          TempletList: res
        })
      }
    })
  },
  // 套路输入
  bindinput: function (res) {
    var that = this;
    var val = res.detail.value;
    that.setData({
      temTextAreaValue: val
    })
  },
  // 套路失去焦点
  textareaBlur: function (res) {
    var that = this;
    var val = res.detail.value;
    if (val == "") {
      that.setData({
        bottomTextArea: true
      })
    }
  },
  // 套路点击确定
  confirmBtn: function (res) {
    var that = this;
    var val = that.data.temTextAreaValue;
    fn.http({
      param: { func: "templet.addTemplet", user_id: app.globalData.user_id, t_content: val },
      success: function (res) {//添加模板消息成功
        // 刷新模板消息
        that.getTempletList();
        that.setData({
          bottomTextArea: true
        })
      }
    })
  },
  // 底部点击加号
  textareaCk: function (res) {
    var that = this;
    that.setData({
      bottomTextArea: false
    })
  },
  // 生日
  bindinputAge(e) {
    var that = this;
    this.setData({ age: that.data.ageData[e.detail.value] })
    console.log(this.data.age)
  },
  // 身高
  bindinputHeight(e) {
    this.setData({ userHeight: e.detail.value })
    console.log(this.data.userHeight)
  },
  // 家乡
  bindinputAddress(e) {
    var that = this;
    this.setData({ multiIndex: e.detail.value, address: that.data.multiArray[e.detail.value] })
    console.log(that.data.multiArray[e.detail.value])
  },
  // 学历
  xlChange(res) {
    this.setData({ xlIndex: res.detail.value })
    console.log(res.detail.value)
  },
  // 行业
  bindinputIndustry(e) {
    this.setData({ industry: e.detail.value })
    console.log(this.data.industry)
  },
  // 薪资
  xzChange(res) {
    this.setData({ xzIndex: res.detail.value })
    console.log(res.detail.value)
  },
  // 房车
  fcChange(res) {
    this.setData({ fcIndex: res.detail.value })
    console.log(res.detail.value)
  },
  // 获取手机号
  bindgetphonenumber(e) {
    var that = this;
    that.setData({
      iv: e.detail.iv,
      encryptedData: e.detail.encryptedData
    })
  },
  // 基本信息注册
  toTab3(res) {
    var that = this;
    if (that.data.userHeight && that.data.industry && that.data.iv) {
      fn.http({
        param: {
          func: 'user.register',
          user_id: app.globalData.user_id,
          industry: that.data.industry,
          year: that.data.age,
          height: that.data.userHeight,
          address: that.data.address,
          iv: that.data.iv,
          encryptedData: that.data.encryptedData
        },
        success: function (res) {
          that.setData({
            popS1Box: false,
            popS2Box: true,
          })
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
    console.log("123")
    if (that.data.xlIndex != 0 && that.data.xzIndex != 0 && that.data.headUrl) {
      fn.http({
        param: {
          func: 'user.userInfoRegister',
          user_id: app.globalData.user_id,
          educate: that.data.xlIndex,
          salary: that.data.xzIndex,
          touringcar: that.data.fcIndex - 0 + 1,
          head: that.data.headUrl,
        },
        success: function (res) {
          that.setData({
            popS2Box: false,
            zhezhao: false
          })
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
  uploadImg(res){
    var that = this;
    that.setData({
      popS2Box:false,
      popUpLoadImg:true
    })
  },
  // 图片选择弹窗关闭
  closePopUpLoad(res){
    this.setData({
      popS2Box: true,
      popUpLoadImg: false
    })
  },
  // 选择相册
  popUpLoadBtn1(res){
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        that.toCanvas(tempFilePaths[0])
        that.closePopUpLoad();
      }
    })
  },
  // 选择相机
  popUpLoadBtn2(res) {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        that.toCanvas(tempFilePaths[0])
        that.closePopUpLoad();
      }
    })
  },
  //开始绘图
  toCanvas(res) {
    wx.showLoading({
      title: '上传中...',
    })
    var img = res;
    let that = this;
    const detail = this.data.detail;
    const ctx = wx.createCanvasContext('shareFrends');    //绘图上下文
    var _width;
    var _height;
    var _width2;
    var _height2;
    var sx;
    var sy;
    wx.getImageInfo({
      src: img,
      success(res) {
        _width = res.width;
        _height = res.height;
        if (_width / 180 > _height / 267) {
          _width2 = _height / 267 * 180;
          _height2 = _height;
          sx = (_width - _width2) / 2;
          sy = 0;
        } else if (_width / 180 < _height / 267) {
          _width2 = _width;
          _height2 = _width / 180 * 267;
          sx = 0;
          sy = (_height - _height2) / 2;
        }
        console.log(sx, sy)
        console.log(_width2, _height2)
        // return false
        ctx.drawImage(img, sx, sy, _width2, _height2, 0, 0, 180, 267)
        ctx.draw();
        setTimeout(function () {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            canvasId: 'shareFrends',
            success: function (res) {
              let shareImg = res.tempFilePath;
              var imgData = {
                func: "user.userPhoto",
                file: shareImg,
                user_id: app.globalData.user_id
              }
              wx.uploadFile({
                url: app.globalData.txUrl,
                filePath: shareImg,
                name: 'file',
                method: 'POST',
                formData: dt.makeMd5Par(imgData),
                success: res => {
                  wx.hideLoading();
                  var res = JSON.parse(res.data).response;
                  that.setData({
                    uploadState: 1,
                    headUrl: res.file,
                    userChoiceImg: shareImg,
                    head: shareImg
                  })
                }
              })
            }
          })
        }, 1000)
      }
    })
  },
})