exports.list = function (req, res) {
    var html = "<h2>你好,本地注册用户 " + req.user.username + "</h2><a href='/logout'>退出</a>";
    res.send(html);
};

exports.github = function (req, res) {
    var html = "<h2>你好, github用户" + req.user.displayName +"(" + req.user.username+")</h2>" +
        "<p>blog: <a href='http://blog.fens.me'>http://blog.fens.me</a></p>" +
        "<p><a href='/logout'>退出</a></p>";
    res.send(html);
};

exports.wechat = function (req, res) {
    var html = "<h2>你好, 微信用户，" + req.user.username +"(" + req.user.name.givenName + " " + req.user.name.familyName+ ")</h2>" +
        "<p><a href='/logout'>退出</a></p>";
    res.send(html);
};