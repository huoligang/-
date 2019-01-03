// pages/redApply/redApply.js
const fn = require('../../utils/function.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    multiArray: [['省'], ['市'], ['县']],
    multiIndex: [0, 0, 0],
    shengIndex: 0,
    shiIndex: 0,
    xianIndex: 0,
    province_id: 0,
    city_id: 0,
    county_id: 0,
    age: 1992,
    ageIndex: 8,
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
  // 姓名
  bindinputName(e) {
    this.setData({ name: e.detail.value })
    console.log(this.data.name)
  },
  // 生日
  bindinputAge(e) {
    var that = this;
    this.setData({ age: that.data.ageData[e.detail.value], ageIndex: e.detail.value})
    console.log(this.data.age)
  },
  // 身份证号
  bindinputIdcard(e){
    this.setData({ idcard: e.detail.value })
    console.log(this.data.idcard)
  }, 
  // 手机号
  bindinputPhone(e) {
    this.setData({ phone: e.detail.value })
    console.log(this.data.phone)
  }, 
  // 微信
  bindinputWx(e) {
    this.setData({ wx: e.detail.value })
    console.log(this.data.wx)
  }, 
  // 家庭住址
  bindinputAddress(e) {
    this.setData({ address: e.detail.value })
    console.log(this.data.address)
  }, 
  // 小区
  bindinputStree(e) {
    this.setData({ stree: e.detail.value })
    console.log(this.data.stree)
  }, 
  // 提交申请
  toapply(res){
    var that = this;
    // var shengIndex = that.data.province_id;
    // console.log(shengIndex)
    if (that.data.idcard && that.data.phone && that.data.wx && that.data.stree && that.data.name){
      fn.http({
        param: {
          func: 'user.hongregis',
          user_id: app.globalData.user_id,
          idcard: that.data.idcard,
          phone: that.data.phone,
          wx: that.data.wx,
          stree: that.data.stree,
          province_id: that.data.sheng2[that.data.multiIndex[0]].id,
          city_id: that.data.shi2[that.data.multiIndex[1]].id,
          county_id: that.data.xian2[that.data.multiIndex[2]].id,
          year:that.data.age,
          nickname: that.data.name
        },
        success: function (res) {
          wx.showModal({
            title: '提示',
            content: '提交成功,等待审核',
            showCancel: false,
            success(res){
              wx.switchTab({
                url: '../index/index',
              })
            }
          })
        }
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '请完善您的信息',
        showCancel: false
      })
    }
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
        
        // fn.http({
        //   param: { func: "user.getAddressInfo", user_id: app.globalData.user_id, lat: latitude, lon: longitude },
        //   success: function (res) {
        //     console.log(res);
        //     wx.hideLoading();
        //     that.setData({
        //       city: res.city,
        //       zhezhao: false
        //     })
        //   }
        // })
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
  // 返回
  backMine(res){
    var that = this;
    wx.switchTab({
      url: '../mine/mine',
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
    that.getSheng();
    // 年龄数据
    var ageData = [];
    for (var i = 2000; i >= 1950; i--) {
      ageData.push(i)
    }
    that.setData({ ageData: ageData },function(){
      fn.http({
        param: { func: "user.me", user_id: app.globalData.user_id },
        success: function (res) {
          var userData = res.userinfo;
          that.setData({
            ageIndex: userData.age == 0 ? 10 : userData.age - 0 - 18,
            name: userData.nickname
          })
        },
      })
    })
    
  },
  //获取用户省区县
  getUserSQX(res){
    var that = this;
    var cs = app.globalData.cs;
    var province_id = cs.province_id;//省
    var city_id = cs.city_id;//市
    var county_id = cs.county_id;//县
    var sheng2 = that.data.sheng2;
    var shengIndex = 0;
    var shiIndex = 0;
    var xianIndex = 0;
    var xian=[]
    var multiIndex = that.data.multiIndex;
    console.log(that.data.sheng2)
    for(var i in sheng2){
      if (sheng2[i].id == province_id){
        multiIndex[0] = shengIndex;
        fn.http({
          param: { func: 'user.getarea', id: sheng2[i].id },
          success: function (res) {
            var shi2 = res.data;
            // console.log
            for(var j in shi2){
              console.log(shi2)
              if (shi2[j].id == city_id){
                multiIndex[1] = shiIndex;
                fn.http({
                  param: { func: 'user.getarea', id: shi2[j].id },
                  success: function (res) {
                    for (var z in res.data) {
                      xian.push(res.data[z].name)
                      if (res.data[z].id == county_id){
                        multiIndex[2] = xianIndex;
                        console.log(multiIndex)
                        that.setData({
                          multiIndex: multiIndex
                        })
                      }else{
                        xianIndex++
                      }
                    }
                    console.log(xian)
                    // var multiArray = that.data.multiArray;
                    // multiArray[2] = xian;
                    // that.setData({
                    //   xian: xian,
                    //   multiArray: multiArray
                    // })

                  }
                })
              }else{
                shiIndex++
              }
            }
          }
        })
        // return false
      }else{
        shengIndex++
      }
      // console.log(shengIndex)
    }
    console.log(shengIndex)
    
    // console.log(that.data.xian2)
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
  // 变化
  addressColumnChange(res) {
    var that = this;
    console.log(res)
    // return false
    var sheng2 = that.data.sheng2;
    var shi2 = that.data.shi2;
    var val = res.detail.value;
    var multiArray = that.data.multiArray;
    var multiIndex = that.data.multiIndex;
    switch (res.detail.column) {
      case 0:
        var shi = [];
        var shi2 = [];
        fn.http({
          param: { func: 'user.getarea', id: sheng2[val].id },
          success: function (res) {
            for (var i in res.data) {
              shi.push(res.data[i].name);
              shi2.push(res.data[i])
            }
            multiArray[1] = shi;
            multiIndex[0] = val;
            multiIndex[1] = 0;
            that.setData({
              shi: shi,
              shi2: shi2,
              shengIndex: val,
              multiArray: multiArray,
              multiIndex: multiIndex
            }, function () {
              var xian = [];
              var xian2 = [];
              console.log(that.data.shiIndex)
              fn.http({
                param: { func: 'user.getarea', id: shi2[0].id },
                success: function (res) {
                  for (var i in res.data) {
                    xian.push(res.data[i].name);
                    xian2.push(res.data[i])
                  }
                  multiArray[2] = xian
                  that.setData({
                    xian: xian,
                    xian2: xian2,
                    multiArray: multiArray
                  })
                }
              })
            })
          }
        })
        break;
      case 1://市
        var xian = [];
        var xian2 = [];
        fn.http({
          param: { func: 'user.getarea', id: shi2[val].id },
          success: function (res) {
            for (var i in res.data) {
              xian.push(res.data[i].name);
              xian2.push(res.data[i])
            }
            multiArray[2] = xian
            that.setData({
              xian: xian,
              xian2: xian2,
              shiIndex: val,
              multiArray: multiArray
            })
          }
        })
        break;
      case 2://县
        that.setData({
          xianIndex: val
        })
        break;
    }
  },
  addressChange(res) {
    var that = this;
    var val = res.detail.value;
    console.log(val)
    that.setData({
      multiIndex: val,
      // address: that.data.multiArray[val]
      province_id:val[0],
      city_id:val[1],
      county_id:val[2]
    })
  },
  // 获取省份
  getSheng(res) {
    var that = this;
    var cs = app.globalData.cs;
    // var province_id = 820;//省
    // var city_id = 887;//市
    // var county_id = 889;//县
    var province_id = cs.province_id == null ? 1 : cs.province_id;//省
    var city_id = cs.city_id == null ? 2 : cs.city_id;//市
    var county_id = cs.county_id == null ? 3 : cs.county_id;//县
    var shengIndex = 0;
    var shiIndex = 0;
    var xianIndex = 0;
    var sheng = [];
    var sheng2 = [];
    var shi = [];
    var shi2 = [];
    var xian = [];
    var xian2 = [];
    var multiArray = that.data.multiArray;
    var multiIndex = that.data.multiIndex;
    fn.http({
      param: { func: 'user.getprovince' },
      success: function (res) {
        for (var i in res.data) {
          sheng.push(res.data[i].name);
          sheng2.push(res.data[i])
          if (res.data[i].id == province_id){
            multiIndex[0] = shengIndex;
            fn.http({
              param: { func: 'user.getarea', id: sheng2[shengIndex].id },
              success: function (res) {

                for (var i in res.data) {
                  shi.push(res.data[i].name);
                  shi2.push(res.data[i])
                  if (res.data[i].id == city_id) {
                    console.log(shi2[shiIndex].id)
                    multiIndex[1] = shiIndex;
                    multiArray[1] = shi;
                    // function () {
                      console.log(shi2[shiIndex].id)
                      fn.http({
                        param: { func: 'user.getarea', id: shi2[shiIndex].id },
                        success: function (res) {
                          for (var i in res.data) {
                            xian.push(res.data[i].name);
                            xian2.push(res.data[i])
                            if (res.data[i].id == county_id) {
                              multiIndex[2] = xianIndex
                            } else {
                              xianIndex++
                            }
                          }
                          multiArray[2] = xian;
                          that.setData({
                            shi: shi,
                            shi2: shi2,
                            xian: xian,
                            xian2: xian2,
                            multiArray: multiArray,
                            multiIndex: multiIndex,
                            province_id: sheng2[multiIndex[0]].id,
                            city_id: shi2[multiIndex[1]].id,
                            county_id: xian2[multiIndex[2]].id
                          })
                          // that.getUserSQX();
                        }
                      })
                    // }
                  } else {
                    shiIndex++
                  }
                }
              }
            })
          }else{
            shengIndex++
          }
        }
        multiArray[0] = sheng
        that.setData({
          sheng: sheng,
          sheng2: sheng2,
          multiArray: multiArray,
          address: multiArray[0]
        })
        // return false
        
      }
    })
  },
})