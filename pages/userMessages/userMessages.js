// pages/userMessages/userMessages.js
const fn = require('../../utils/function.js');
var dt = require('../../utils/dt.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */

  data: {
    sexData: ['男', '女'],
    // sexIndex: 0,
    age: 1992,
    // ageIndex: 0,
    xz: ['收入', '2000~4000', '4000~6000', '6000~10000', '10000~15000', '15000以上'],
    xzIndex: 0,
    fc: ['车房', '无车无房', '无车有房', '有车无房', '有车有房'],
    fcIndex: 0,
    xl: ['学历', '专科以下', '专科', '本科', '硕士', '博士及以上'],
    xlIndex: 0,
    phoneState:0,
    xingge: ['选择性格', '内向', '外向'],
    xinggeIndex: 0,
    fumu: ['双全', '母亲', '父亲'],
    fumuIndex: 0,
    gw: ['过往', '未婚', '离异'],
    gwIndex: 0,
    zhusu: ['父母', '独居'],
    zhusuIndex: 0,
    shengxiao: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    shengxiaoIndex: 0,
    xingzuo: ['处女座', '狮子座', '双鱼座', '天蝎座', '摩羯座', '金牛座', '巨蟹座', '双子座', '天秤座', '水瓶座', '白羊座', '射手座'],
    xingzuoIndex: 0
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
  // 返回
  backMine(res) {
    var that = this;
    wx.switchTab({
      url: '../mine/mine',
    })
  },
  // 性别选择
  bindPickerChange: function (e) {
    this.setData({
      sexIndex: e.detail.value
    })
  },
  // 生日
  bindinputAge(e) {
    var that = this;
    this.setData({ age: e.detail.value })
  },
  // 身高
  bindinputHeight(e) {
    this.setData({ userHeight: e.detail.value })
  },
  // 家乡
  bindinputAddress(e) {
    var that = this;
    this.setData({ multiIndex: e.detail.value, address: that.data.multiArray[e.detail.value] })
  },
  // 姓名
  bindinputName(e) {
    this.setData({
      zcName: e.detail.value
    })
  },
  // 学历
  xlChange(res) {
    this.setData({ xlIndex: res.detail.value })
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
  // 过往
  gwChange(res) {
    this.setData({ gwIndex: res.detail.value })
  },
  // 获取手机号
  bindgetphonenumber(e) {
    var that = this;
    fn.http({
      param: {
        func: 'user.registerphone',
        user_id: app.globalData.user_id,
        iv: e.detail.iv,
        encryptedData: e.detail.encryptedData,
      },
      success: function (res) {
        that.setData({
          phoneState: 1
        })
      }
    })
  },
  // 非必填项
  // 生肖
  shengxiaoChange(res){
    this.setData({ shengxiaoIndex: res.detail.value })
  },
  // 星座
  xingzuoChange(res) {
    this.setData({ xingzuoIndex: res.detail.value })
  },
  // 性格
  xinggeChange(res) {
    this.setData({ xinggeIndex: res.detail.value })
  },
  // 家庭成员
  bindinputjiating(res) {
    this.setData({ jiating: res.detail.value })
  },
  // 父母
  fumuChange(res) {
    this.setData({ fumuIndex: res.detail.value })
  },
  // 兴趣
  bindinputxingqu(res) {
    this.setData({ xingqu: res.detail.value })
  },
  // 和谁住
  zhusuChange(res) {
    this.setData({ zhusuIndex: res.detail.value })
  },
  // 和谁住
  bindinputzhusu(res) {
    this.setData({ zhusu: res.detail.value })
  },
  // 注册
  compile(res) {
    var that = this;
    if (that.data.userHeight && that.data.industry && that.data.headUrl && that.data.address != "") {
      // 基本信息
      fn.http({
        param: {
          func: 'user.register',
          user_id: app.globalData.user_id,
          gender: that.data.sexIndex == 0 ? 1 : 2,
          year: that.data.ageData[that.data.age],
          height: that.data.userHeight,
          address: that.data.address,
          industry: that.data.industry,
          head: that.data.headUrl,
        },
        success: function (res) {
          console.log('更改信息成功');
        }
      })
      // 隐私信息
      fn.http({
        param: {
          func: 'user.userInfoRegister',
          user_id: app.globalData.user_id,
          educate: that.data.xlIndex,
          salary: that.data.xzIndex,
          touringcar: that.data.fcIndex,
          marriage_history: that.data.gwIndex
        },
        success: function (res) {
          // 用户信息
          that.userMsg();
          app.getUserMsg();
          wx.showToast({
            title: '保存成功',
            icon: 'none'
          })
        }
      })
      // 非必填信息
      fn.http({
        param: {
          func: 'user.userdata',
          user_id: app.globalData.user_id,
          zodiac: that.data.shengxiao[that.data.shengxiaoIndex],
          family: that.data.jiating,
          parent: that.data.fumu[that.data.fumuIndex],
          with_who: that.data.zhusu[that.data.zhusuIndex],
          constellation: that.data.xingzuo[that.data.xingzuoIndex],
          character: that.data.xinggeIndex?that.data.xingge[that.data.xinggeIndex]:'',
          interest: that.data.xingqu,
        },
        success: function (res) {
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
    // // 用户信息
    that.userMsg();
    // 年龄数据
    var ageData = [];
    for (var i = 2000; i >= 1950; i--) {
      ageData.push(i)
      that.setData({ ageData: ageData })
  }
},
// 更改用户图片
updateImg(res){
  var that = this;
  wx.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success(res) {
      // tempFilePath可以作为img标签的src属性显示图片
      const tempFilePaths = res.tempFilePaths
      that.setData({
        userChooseImg: tempFilePaths
      })
      that.toCanvas();
      
    }
  })
},
  //开始绘图
  toCanvas() {
    wx.showLoading({
      title: '上传中...',
    })
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
      src: that.data.userChooseImg[0],
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
        console.log(sx,sy)
        console.log(_width2, _height2)
        // return false
        ctx.drawImage(that.data.userChooseImg[0], sx, sy, _width2, _height2, 0, 0, 180, 267)
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
                  console.log(res)
                  that.setData({
                    uploadState: 1,
                    headUrl: res.file,
                    head:shareImg
                  })
                }
              })
            }
          })
        }, 1000)
      }
    })
    return false
},
// 用户信息
userMsg(res){
  var that = this;
  fn.http({
    param: { func: "user.me", user_id: app.globalData.user_id},
    success: function (res) {
      var userData = res.userinfo;
      var xinggeIndex='';
      var fumuIndex='';
      var zhusuIndex = 0;
      if (userData.character=='内向'){xinggeIndex=1}
      if (userData.character == '外向') { xinggeIndex = 2 }
      if (userData.parent == '母亲') { fumuIndex = 1 }
      if (userData.parent == '父亲') { fumuIndex = 2 }
      if (userData.with_who == '独居') { zhusuIndex = 1 }
      that.setData({
        userMessagesData: res.userinfo,
        sexIndex: userData.gender - 0 - 1,
        age: userData.age == 0 ? 10 : userData.age-0-18,
        userHeight: userData.height == 0 ? 168 : userData.height,
        address: userData.address,
        username:userData.nickname,
        head: userData.head,
        headUrl: userData.head,
        xlIndex: userData.educate,
        industry: userData.industry,
        xzIndex: userData.salary,
        fcIndex: userData.touringcar == 0 ? 1 : userData.touringcar,
        phoneState: userData.phone?1:0,
        gwIndex: userData.marriage_history,//婚史
        // shengxiao: userData.zodiac !='undefined' ? userData.zodiac:'无',
        // xingzuo: (userData.constellation != 'undefined' || userData.constellation != null) ? userData.constellation : '无',
        xinggeIndex: xinggeIndex == '' ? 0 : xinggeIndex,
        jiating: (userData.family != 'undefined' && userData.family != null) ? userData.family : '无',
        fumuIndex: fumuIndex == '' ? 0 : fumuIndex,
        xingqu: (userData.interest != 'undefined' && userData.interest != null) ? userData.interest : '无',
        zhusuIndex: zhusuIndex,
      })
      var shengxiaoIndex;
      var xingzuoIndex;
      // 生肖星座
      if (userData.zodiac != 'undefined'){
        switch (userData.zodiac){
          case '鼠': shengxiaoIndex=0; break;
          case '牛': shengxiaoIndex = 1; break;
          case '虎': shengxiaoIndex = 2; break;
          case '兔': shengxiaoIndex = 3; break;
          case '龙': shengxiaoIndex = 4; break;
          case '蛇': shengxiaoIndex = 5; break;
          case '马': shengxiaoIndex = 6; break;
          case '羊': shengxiaoIndex = 7; break;
          case '猴': shengxiaoIndex = 8; break;
          case '鸡': shengxiaoIndex = 9; break;
          case '狗': shengxiaoIndex = 10; break;
          case '猪': shengxiaoIndex = 11; break;
        }
        that.setData({
          shengxiaoIndex: shengxiaoIndex
        })
      }
      // 生肖星座
      if (userData.constellation != 'undefined') {
        switch (userData.constellation) {
          case '处女座': xingzuoIndex = 0; break;
          case '狮子座': xingzuoIndex = 1; break;
          case '双鱼座': xingzuoIndex = 2; break;
          case '天蝎座': xingzuoIndex = 3; break;
          case '摩羯座': xingzuoIndex = 4; break;
          case '金牛座': xingzuoIndex = 5; break;
          case '巨蟹座': xingzuoIndex = 6; break;
          case '双子座': xingzuoIndex = 7; break;
          case '天秤座': xingzuoIndex = 8; break;
          case '水瓶座': xingzuoIndex = 9; break;
          case '白羊座': xingzuoIndex = 10; break;
          case '射手座': xingzuoIndex = 11; break;
        }
        that.setData({
          xingzuoIndex: xingzuoIndex
        })
      }

      //省份数据
      var multiArray = [];
      var sheng = [];
      var multiIndex = 0;
      fn.http({
        param: { func: 'user.getprovince' },
        success: function (res) {
          for (var i in res.data) {
            multiArray.push(res.data[i].name);
            if (res.data[i].name == that.data.address){
              that.setData({
                multiIndex: multiIndex
              })
            }else{
              multiIndex++
            }
        }
          that.setData({
            multiArray: multiArray,
            // address: multiArray[0]
          })
        }
      })
      

    },
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

}
})