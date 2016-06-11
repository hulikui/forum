exports.wechat = function (req, res) {
	console.log('Passport注册用户session',req.user);
    var html = "<h2>你好,北大软微微信企业号注册用户," + req.user.name + "</h2><img src="+req.user.avatar+"   height='60px' width='60px'><a href='/logout'>退出</a>";
    res.send(html);
};

exports.github = function (req, res) {
	var name=req.user.name||req.user.username;
/*	if(req.user.name){
		name=req.user.name;	
	}else{
		name=req.user.username;
	}*/
    var html = "<h2>你好, github用户(" +name+")</h2>" +
        "<p>blog: <a href='http://www.ssforum.top'>主页</a></p>" +
        "<p><a href='/logout'>退出</a></p>";
    res.send(html);
};

exports.qq = function (req, res) {
	var url=req.user._json.figureurl_qq_1;
    var html = "<h2>你好, QQ用户，<img src="+url+">" + req.user.nickname +"</h2>" +
	"<p>仅供测试，暂不支持账号合并,请用微信或者本地登录</p>"+
        "<p><a href='/logout'>退出</a></p>";
    res.send(html);
};
