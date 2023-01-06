// mine.js
var app = getApp()
// 自定义标签
var iconPath = "../../images/icons/"
var tabs = [
    {
        "icon": iconPath + "mark.png",
        "iconActive": iconPath + "markHL.png",
        "title": "日记",
        "extraStyle": "",
    },
    {
        "icon": iconPath + "collect.png",
        "iconActive": iconPath + "collectHL.png",
        "title": "收藏",
        "extraStyle": "",
    },
    {
        "icon": iconPath + "like.png",
        "iconActive": iconPath + "likeHL.png",
        "title": "喜欢",
        "extraStyle": "",
    },
    {
        "icon": iconPath + "more.png",
        "iconActive": iconPath + "moreHL.png",
        "title": "更多",
        "extraStyle": "border:none;",
    },
]
var userInfo = {
    avatar: "https://pic4.zhimg.com/e515adf3b_xl.jpg",
    nickname: "小闹钟",
    sex: "♂",  // 0, male; 1, female
    meta: '1篇日记',
}

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({

    // data
    data: {
        avatarUrl: defaultAvatarUrl,
        // 展示的tab标签
        tabs: tabs,

        // 当前选中的标签
        currentTab: "tab1",

        // 高亮的标签索引
        highLightIndex: "0",

        // 模态对话框样式 
        modalShowStyle: "",

        // 待新建的日记标题
        diaryTitle: "",

        // TODO 用户信息
        userInfo: userInfo,
    },

    // 隐藏模态框
    hideModal() {
        this.setData({modalShowStyle: ""});
    },

    // 清除日记标题
    clearTitle() {
        this.setData({diaryTitle: ""});
    },

    onShow: function() {
        this.hideModal();
        this.clearTitle();
    },

    // 点击tab项事件
    touchTab: function(event){
        var tabIndex = parseInt(event.currentTarget.id);
        var template = "tab" + (tabIndex + 1).toString();

        this.setData({
            currentTab: template,
            highLightIndex: tabIndex.toString()
        }
        );
    },
    getUserRecord () {
        // 进入错误回调后 清楚缓存授权数据
        wx.getSetting({
            withSubscriptions: true,
            success (res) {
              console.log('已授权用户权限', res.authSetting)
              console.log(res.subscriptionsSetting)
              // res.subscriptionsSetting = {
              //   mainSwitch: true, // 订阅消息总开关
              //   itemSettings: {   // 每一项开关
              //     SYS_MSG_TYPE_INTERACTIVE: 'accept', // 小游戏系统订阅消息
              //     SYS_MSG_TYPE_RANK: 'accept'
              //     zun-LzcQyW-edafCVvzPkK4de2Rllr1fFpw2A_x0oXE: 'reject', // 普通一次性订阅消息
              //     ke_OZC_66gZxALLcsuI7ilCJSP2OJ2vWo2ooUPpkWrw: 'ban',
              //   }
              // }
              if (!res.authSetting['scope.record']) {
                wx.authorize({
                  scope: 'scope.record',
                  success () {
                    // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                    wx.startRecord()
                  }
                })
              }
            }
          })
    },
    getLogin () {
        // 1.调用接口获取登录凭证（code）
        const _this = this
        wx.login({
            success(res) {
                if (res.code) {
                    console.log('登录code', res.code)
                    // 调用开发服务器
                    wx.request({
                        url: 'http://127.0.0.1:3000/login',
                        method: 'post',
                        data: { code: res.code },
                        success (res) {
                            console.log('token', res)
                            // 将token保存为公共数据（用于在多页面中访问）
                            app.globalData.token = res.data.token
                            // 将token保存到数据缓存（下次打开小程序无需重新获取token）
                            wx.setStorage({ key: 'token', data: res.data.token })
                        }
                    })
                }
            }
        })
    },
    checkIsLogin() {
        console.log('判断是否已经登录')
        this.checkLogin(res => {
          console.log('is_login: ', res.is_login)
          if (!res.is_login) {
            this.getLogin()
          }
        })
    },
    checkLogin: function (callback) {
        var token = app.globalData.token
        if (!token) {
          // 从数据缓存中获取token
          token = wx.getStorageSync('token')
          if (token) {
            app.globalData.token = token
          } else {
            callback({ is_login: false })
            return
          }
        }
        wx.request({
          url: 'http://127.0.0.1:3000/checklogin',
          data: { token: token },
          success: res => {
            callback({ is_login: res.data.is_login })
          }
        })
    },
    getUserInfo () {
        // 经验证不能调起询问弹窗 默认灰色头像和匿名用户
        wx.getUserProfile({
            desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
              console.log(res)
            }
          })
    },
    getPhoneNumber (e) {
        // 个人不支持
        console.log(e.detail.code)
      },
      onChooseAvatar(e) {
        const { avatarUrl } = e.detail 
        this.setData({
          avatarUrl,
        })
      },
    bindGetUserInfo: function(e) {
        console.log(e,'-------------')
        if (e.detail.userInfo) {
            //用户按了允许授权按钮
            var that = this;
            // 获取到用户的信息了，打印到控制台上看下
            console.log("用户的信息如下：");
            console.log(e.detail.userInfo);
            //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
            that.setData({
                isHide: false
            });
        } else {
            //用户按了拒绝按钮
            wx.showModal({
                title: '警告',
                content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
                showCancel: false,
                confirmText: '返回授权',
                success: function(res) {
                    // 用户没有授权成功，不需要改变 isHide 的值
                    if (res.confirm) {
                        console.log('用户点击了“返回授权”');
                    }
                }
            });
        }
    },

    // 点击新建日记按钮
    touchAdd: function (event) {
        this.setData({
            modalShowStyle: "opacity:1;pointer-events:auto;"
        })
    },

    // 新建日记
    touchAddNew: function(event) {
        this.hideModal();

        wx.navigateTo({
            url: "../new/new?title=" + this.data.diaryTitle,
        });
    },

    // 取消标题输入
    touchCancel: function(event) {
        this.hideModal();
        this.clearTitle();
    }, 

    // 标题输入事件
    titleInput: function(event) {
        this.setData({
            diaryTitle: event.detail.value,
        })
    }
})
