var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({
  data: {
    borderRadius: 5,
    latitude: 0,
    longitude: 0,
    markers: [],
    callout: {
      content: '您的位置',
      bgColor: "#736F6E",
      color: "#ffffff",
      padding: 10,
      display: "ALWAYS",
      borderRadius: 5
    },
    mobileLocation: {//移动选择位置数据
      longitude: 0,
      latitude: 0,
      address: '',
    }
  },
  onLoad: function () {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'qq-map key'
    });
    var that = this;
    //获取位置
    wx.getLocation({
      type: 'gcj02',//默认为 wgs84 返回 gps 坐标，gcj02 返回可用于wx.openLocation的坐标
      success: function (res) {
        console.log(res);
        var marker = [{
          id: 0,
          latitude: res.latitude,
          longitude: res.longitude,
          callout: {//窗体
            content: that.data.callout.content,
            bgColor: that.data.callout.bgColor,
            color: that.data.callout.color,
            padding: that.data.callout.padding,
            display: that.data.callout.display,
            borderRadius: that.data.callout.borderRadius
          },
        },
          {
            id: 1,
            latitude: 39.918421,
            longitude: 116.442819,
            callout: {//窗体
              content: that.data.callout.content,
              bgColor: that.data.callout.bgColor,
              color: that.data.callout.color,
              padding: that.data.callout.padding,
              display: that.data.callout.display,
              borderRadius: that.data.callout.borderRadius
            },
          }
        ];
        var mobileLocation = {
          latitude: res.latitude,
          longitude: res.longitude,
        };
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          markers: marker,
        });
        //根据坐标获取当前位置名称，显示在顶部:腾讯地图逆地址解析
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (addressRes) {
            var address = addressRes.result.formatted_addresses.recommend;
            mobileLocation.address = address;
            console.log(address)
            //当前位置信息
            that.setData({
              mobileLocation: mobileLocation,
            });
          }
        });
      }
    });

    this.mapCtx = wx.createMapContext('qqMap');
  },

  //移动选点
  moveToLocation: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res);
        var marker = [{
          id: 0,
          latitude: res.latitude,
          longitude: res.longitude,
          callout: {//窗体
            content: that.data.callout.content,
            bgColor: that.data.callout.bgColor,
            color: that.data.callout.color,
            padding: that.data.callout.padding,
            display: that.data.callout.display,
            borderRadius: that.data.callout.borderRadius
          },
        }];
        let mobileLocation = {
          longitude: res.longitude,
          latitude: res.latitude,
          address: res.address,
        };
        that.setData({
          mobileLocation: mobileLocation,
          markers: marker
        });
      },
      fail: function (err) {
        console.log(err)
      }
    });
  }
});