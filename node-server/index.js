const express=require('express') //加载express模块

const request= require('request') //加载request模块

const bodyParser=require('body-parser')   //加载bodyParser模块用来解析客户端发过来的实体信息

const app=express()//创建express实例，保存在app中

app.use(bodyParser.json()) //将bodyParser解析模块加入到app中，采用json格式，

//因为微信小程序提交给服务器的信息采用json格式

const wx = {

     appid: 'wx1b7a5ccda6cd53d5', //填写自己的appID

    secret: '667336036a072047209f0755edfa3a76' //填写自己的AppSecret

}

var db = {//模拟数据库

    session: {},//保存openid和sesson_key

    user: {}

}

//处理post请求

app.post('/login', (req, res) => { //接收post请求，第一个参数为请求路径，第二个参数为回调函数 // 注意：小程序端的appid必须使用真实账号，如果使用测试账号，会出现login code错误

    console.log('login code: ' + req.body.code)

    var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + wx.appid + '&secret=' + wx.secret + '&js_code=' + req.body.code + '&grant_type=authorization_code'

    request(url, (err, response, body) => {

        console.log('session: ' + body) //body里面存放sesson_key和openid

        var session = JSON.parse(body) //转换为JSON格式

        if(session.openid) {

            var token = 'token_' + new Date().getTime()

            db.session[token] = session //将sesson_key和openid存到数据库

            // **保存用户记录，相当于服务器注册了一个新用户并设置初始积分为** **100**

            if(!db.user[session.openid]) {

                db.user[session.openid] = {

                    credit: 100

                }

            }

        }

        res.json({

            token: token //将生成的token相应给小程序

        })

    })

})

app.get('/checklogin', (req, res) => {

        var session = db.session[req.query.token]
    
        console.log('checklogin: ', session)
    
        // 将用户是否已经登录的布尔值返回给客户端
    
        res.json({
    
            is_login: session !== undefined    //根据token取出的sesson是否为undefined，如果是说明token过期，否则有效
    
        })
    
})


//监听3000端口

app.listen(3000,()=>{

 console.log('server running at http://127.0.0.1:3000')

})