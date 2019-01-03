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
    xz: ['收入', '1000~5000', '5000~10000', '10000~20000', '20000以上'],
    // xzIndex: 0,
    fc: ['车房', '无车无房', '无车有房', '有车无房', '有车有房'],
    // fcIndex: 0,
    xl: ['学历', '高中及以下', '专科', '本科', '硕士', '博士及以上'],
    // xlIndex: 0,
    phoneState:0
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
    console.log(this.data.sexIndex)
  },
  // 生日
  bindinputAge(e) {
    var that = this;
    this.setData({ age: e.detail.value })
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
  // 姓名
  bindinputName(e) {
    this.setData({
      zcName: e.detail.value
    })
    console.log(this.data.zcName)
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
      encryptedData: e.detail.encryptedData,
      phoneState:1
    })
  },
  // 注册
  compile(res) {
    var that = this;
    if (that.data.xlIndex && that.data.userHeight && that.data.industry && that.data.xzIndex && that.data.fcIndex && (that.data.iv||that.data.phoneState) && that.data.headUrl) {
      // 基本信息
      fn.http({
        param: {
          func: 'user.register',
          user_id: app.globalData.user_id,
          // nickname: that.data.zcName,
          gender: that.data.sexIndex == 0 ? 1 : 2,
          year: that.data.ageData[that.data.age],
          head: that.data.headUrl,
          height: that.data.userHeight,
          address: that.data.address,
          industry: that.data.industry,
          // salary: that.data.xzIndex,
          // touringcar: that.data.fcIndex,
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
          iv: that.data.iv,
          encryptedData:that.data.encryptedData
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
        phoneState: userData.phone?1:0
      })
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