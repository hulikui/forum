### 论坛项目
*   node.js+ace模板
##  实现的基本功能
    [Passport的三方登陆](https://github.com/hulikui/passport2) qq,wechat,github以及微信企业号的双端登陆,本地登陆
    用户的注册页面匹配验证
    帖子的增删改查，markdown富文本编辑器，帖子的分类标签查询 
    活动的发起与投票
    把微信墙加到公用应用模块中
    把在线聊天应用加入到公用应用模块中--涉及多应用缓存session的问题来获取到用户名
##  功能和模块：
    views 文件下的index.ejs 具体阐述实现的功能和使用到的主要模块，运行状态下 直接输入/路径即可**[查询](http://www.ssforum.top/)**
##  运行环境
    数据库 mongodb
    安装依赖 npm install
    运行 node server.js

##  测试
    第三方登录必须严格匹配官方API设置
    建议测试用三方登录下的微信手机客户端登录
##  小组成员
    组长 胡利奎 组员 张朝卫
