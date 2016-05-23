var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path')
    , app = express();

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , GithubStrategy = require('passport-github').Strategy
    ,qqStrategy=require('passport-qq').Strategy

app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser())
app.use(express.session({secret: 'blog.fens.me', cookie: { maxAge: 60000 }}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

passport.use('local', new LocalStrategy(
    function (username, password, done) {
        var user = {
            id: '1',
            username: 'admin',
            password: 'pass'
        }; // 可以配置通过数据库方式读取登陆账号

        if (username !== user.username) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (password !== user.password) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
    }
));

passport.use(new GithubStrategy({
    clientID: "d559d01c9c2b9e3a2c3b",
    clientSecret: "5df324f166fa8d280d3f2dc5ccff141e786a02ed",
    callbackURL: "http://localhost:3000/auth/github/callback"
},function(accessToken, refreshToken, profile, done) {
    done(null, profile);
}));
passport.use(new qqStrategy({
    clientID: "101315903",
    clientSecret: "6057b33da46b42a0d09703e4bb72f684",
    callbackURL: "http://www.ssforum.top/auth/qq/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ qqId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

passport.serializeUser(function (user, done) {//保存user对象
console.log(user);
    done(null, user);//可以通过数据库方式操作
});

passport.deserializeUser(function (user, done) {//删除user对象
    done(null, user);//可以通过数据库方式操作
});

app.get('/', routes.index);
app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/users',
        failureRedirect: '/'
    }));

app.all('/users', isLoggedIn);
app.get('/users', user.list);
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.all('/github', isLoggedIn);
app.get("/github",user.github);
app.get("/auth/github", passport.authenticate("github",{ scope : "email"}));
app.get("/auth/github/callback",
    passport.authenticate("github",{
        successRedirect: '/github',
        failureRedirect: '/'
    }));

app.all('/qq', isLoggedIn);
app.get("/qq",user.qq);
app.get("/auth/qq", passport.authenticate("linkedin",{}));
app.get("/auth/qq/callback",
    passport.authenticate("qq",{
        successRedirect: '/qq',
        failureRedirect: '/'
    }));

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
