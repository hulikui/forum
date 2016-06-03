var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path')
	,flash=require('express-flash')
    , app = express()
	,crypto=require('crypto')
	,markdown = require('markdown').markdown;

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , GithubStrategy = require('passport-github').Strategy
    ,qqStrategy=require('passport-qq').Strategy

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
//定义数据解析器
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser())
app.use(express.session({
	secret: 'blog.fens.me', 
	cookie: { maxAge: 60000*20 },
	resave:false,
	saveUninitialized:true
	
	}));
var mongoose=require('mongoose');
   //引入模型
  var models=require('./models/models');
  var User=models.User;
  var Topic=models.Topic;
  var Reply=models.Reply;
  var Activity=models.Activity;
  var dbUrl='mongodb://loaclhost:27017/forum';
  //使用mongoose连接服务器
  
  mongoose.connect('mongodb://127.0.0.1:27017/forum');
  mongoose.connection.on('error',console.error.bind(console,'连接数据库失败'))    ;
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//建立session模型
app.use(function(req, res, next){
　　res.locals.user = req.session.user;
　　var error = req.flash('error');
　　res.locals.message = '';
　　if (error) res.locals.message = '<div class="alert alert-warning">' + error + '</div>';
　　next();
});
  
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

passport.use('local', new LocalStrategy(
    function (username, password, done) {
        //var user = {
          //  id: '1',
          //  username: 'admin',
          //  password: 'pass'
       // };
	   // 可以配置通过数据库方式读取登陆账号
	User.findOne({username:username},function(err,user){
			   if(err){
                 console.log(err);
				 var userr='用户名密码错误！'
			 return done(null, false, { message: err });
                 
                  }
                  if(!user){
                 console.log('用户名不存在！');
				
				
                 return done(null, false, { message: 'Incorrect username.' });
                 }
                  //对密码进行MD加密
                 var md5=crypto.createHash('md5'),
                  md5password=md5.update(password).digest('hex');
                  if(user.password!==md5password){
					  console.log('密码错误');
					  
					
					
					return done(null, false, { message: 'Incorrect password.' });
				  }
				  console.log('登陆成功');
				return done(null, user);
				
	});			
    }
));

passport.use(new GithubStrategy({
    clientID: "9ee1f7a0dba3a16c4dbf",
    clientSecret: "5abb4c698b7f9500166531e837ff0ca73bac0bf6",
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

    done(null, user);//可以通过数据库方式操作
});

passport.deserializeUser(function (user, done) {//删除user对象
    done(null, user);//可以通过数据库方式操作
});

app.get('/',function(req,res){

    res.render('index');
});
app.get('/login',function(req,res){

    res.render('login',{
        message:req.flash('message') ,
        title:'北京大学软件与微电子学院校园论坛'
    });
});
app.get('/userInfo',function(req,res){
		User.find({username:req.user.username}).exec(function(err,userInfos){
			if(err){
				console.log(err);
				return res.redirect('/userInfo');
			}
			res.render('userInfo',{
			user:req.user,
			userInfo:userInfos
		});
		console.log(userInfos);
		});
});
//查找话题数据
app.get('/forum', function(req, res){
	console.log(req.user);
	var page = req.query.page ? parseInt(req.query.page) : 1;

      Topic.find(page,function (err,topics,total){
          if(err){
              posts = [];
          }
          res.render('forum', {
			
              user: req.user,
              page : page,
              isFirstPage : (page -1) === 0,
              isLastPage : ((page-1)*10 + topics.length) === total,
              topics :topics,
              success: req.flash('success').toString(),
              error: req.flash('error').toString()
          });
      });
  });
 
 app.get('/editor', function(req, res){
	 var topic={
			title:'点击编辑',
			zonelabel:'选择编辑',
			content:' ',
			zone:'选择编辑'
	 }
    res.render('editor', {
		user: req.user,
		topic : topic
		});
  });
 app.get('/editor/:id', function(req, res){
	  //查找数据
	  //在前端富文本插入内容数据
	  console.log(req.params.id);
	  Topic.findOne(req.params.id,function(err,topic){
          if(err) {
              req.flash('err',err);
              res.redirect('/');
          }
          res.render('editor',{
              topic : topic,
              user:req.user,
              success: req.flash('success').toString(),
              error: req.flash('error').toString()
          });
      });
   
  });
 app.post('/editor/:id', function(req, res){
	  //更新数据
	  //在前端富文本插入内容数据
	  console.log(req.params.id);
	  var updateInfo={
			title:req.body.title,
			zonelabel:req.body.zonelabel,
			content:req.body.content,
			zone:req.body.zone 
	  }
	  Topic.update(req.params.id,updateInfo,function(err){
          if(err) {
              req.flash('err',err);
              res.redirect('/');
          }
		  console.log('更新话题成功');
          res.redirect('/users');
      });
   
  });
 app.post('/editor',function(req,res)
  {       
		var topic=new Topic({
			title:req.body.title,
			author:req.user.username,
			zonelabel:req.body.zonelabel,
			content:req.body.content,
			zone:req.body.zone
		});
		console.log(topic);
		topic.save(function(err,doc){
			if(err){
				console.log('err');
				return res.redirect('/editor');
			}
			console.log('文章发表成功！');
			return res.redirect('/users');
		});
		
 });
 //评论的发表 找到话题 插入push话题评论
 app.post('/reply/:_id',function(req,res){
			var docs	= req.body.content;
			
                        docs = markdown.toHTML(docs);
                   
	//对markdown格式进行解析
	var topicID=req.body.topic_id;
	 var reply=new Reply({
		 content:docs,
		 topic_id:topicID,     //req.params.id,
		 author:req.user.username,
		 author_id:req.user.studentId
		 
	 });
	 console.log('回复的内容：',reply);
	
	 Topic.update(topicID, {$push: {comments: reply}}, {upsert:true},function(err){
			if(err){
				console.log('err');
				return res.redirect('/forum');
			}
			
			console.log('评论发表成功！');
			return res.redirect('/forum');
		});
	
	 
 });
 app.get('/calendar', function(req, res){
    res.render('calendar', { user: req.user });//CanAddEvent
  });
 app.get('/calendars', function(req, res){
     Activity.find(function(err,activitys){
			//console.log('获取所有活动',activitys);
			res.jsonp(activitys);
		});
  }); 
 app.post('/addCalEvent',function(req,res)//app.post('/flow/save', require('body-parser').json(), traffic);
  {       
		
		var activity=new Activity({
			builder:req.user.username,
			event:req.body.event,
			title:req.body.title,
			start:req.body.start,
			end:req.body.end,
			className:req.body.className
			
		});
		console.log(activity);
		
		activity.save(function(err,doc){
			if(err){
				console.log('err');
				return res.redirect('/calendars');
			}
			console.log('插入活动成功',activity._id);
			Activity.update({_id:activity._id},{id:activity._id},function(err){
				console.log('更新ID成功',err);
			});
			return res.redirect('/calendars');
		});
		
 });
  app.post('/updateCalEvent/:_id',function(req,res)//app.post('/flow/save', require('body-parser').json(), traffic);
  {     var id=req.body.id;
		
		console.log(req.body);
		if(req.body.vote=="favorer"){
			Activity.update({_id:req.params._id}, {$push: {favorer: req.user.studentId}},function(err){
			if(err){
				console.log('err');
				return res.redirect('/calendar');
			}
			
			console.log('投票测试');
			return res.redirect('/calendar');
		});
		}else{
			Activity.update({_id:req.params._id}, {$push: {objector: req.user.studentId}},function(err){
			if(err){
				console.log('err');
				return res.redirect('/calendar');
			}
			
			console.log('投票测试');
			return res.redirect('/calendar');
		});
		}
		
		
		
 });
 app.post('/delCalEvent/:_id',function(req,res)//app.post('/flow/save', require('body-parser').json(), traffic);
  {      
		var id=req.body;//body提供的是Json格式的ID 但是req.params.id 获取的是字符串 mongoose无法自动转为为ObjectId  mogondb会自动转换
		
		console.log('后台删除ID',id);
		Activity.findByIdAndRemove({_id:req.body._id},function(err){
					 if(err){
						 console.log(err);
						  req.flash('error',err);
						  return res.redirect('/calendars');
					 }
					req.flash('success','活动删除成功');
					console.log("活动删除成功");
					return res.redirect('/calendars');
				});
		
 });
  
app.get('/task', function(req, res){
    res.render('task', { user: req.user });
  });
app.get('/register',function(req,res)
  {       console.log('注册！');
        if(req.session.user){
				return res.redirect('/list');
			  }
		
		else{
          res.render('register',{
			  user:req.session.user,
			  title:'注册'});
			  }
 });
  //post请求
  app.post('/register',function(req,res){
         //req.body 可以获取到表单的每一项数据
         var username=req.body.username,
                password=req.body.password,
                passwordRepeat=req.body.passwordRepeat,
				 studentId=req.body.studentId,
				  grade=req.body.grade,
				   email=req.body.email;
				   
				
          //检查输入的用户名是否为空，使用trim去掉两端的空格
          if(username.trim().length==0){
         console.log('用户名不能为空！');
          return res.redirect('/register');
  }
          //检查输入的密码是否为空，使用trim
          if(password.trim().length==0||passwordRepeat.trim().length==0){
          console.log('密码不能为空！');
          return res.redirect('/register');
  }
          //检查两次输入的密码是否一致
          if(password!=passwordRepeat){
          console.log('两次输入的密码不一致');
          return res.redirect('/register');
  }
          //检查用户名是否已经存在，不存在则保持数据
          User.findOne({username:username},function(err,user){
			   if(err){
                 console.log(err);
                  return res.redirect('/register')
                  }
                  if(user){
                 console.log('用户名已经存在！');
                 return res.redirect('/register');
                 }
                  //对密码进行MD加密
                 var md5=crypto.createHash('md5'),
                  md5password=md5.update(password).digest('hex');
                  //新建user对象用于保存数据
                  var newUser=new User({
                        username:username,
                        password:md5password,
						studentId:studentId,
						grade:grade,
						email:email
                 });
				 console.log(newUser);
                  newUser.save(function(err,doc){
                          if(err){console.log(err);
                          return res.redirect('/register');
                          }
                          console.log('注册成功！');
                         return res.redirect('/login');
                 });
});
});
app.post('/login', passport.authenticate('local', {
    successRedirect: '/users',
    failureRedirect: '/login',
	failureFlash: true
}));

app.all('/users', isLoggedIn);
app.get('/users', function(req, res){
   
    Topic.find({author:req.user.username}).exec(function(err,userTopics){
			
			
			
			if(err){
				console.log(err);
				return res.redirect('/users');
			}
			res.render('list',{
			user:req.user,
			userTopics:userTopics
		});
		
		});

	
	
	
	
	
  });
  app.get('/listdata',function(req,res){
		 Topic.find({author:req.user.username}).exec(function(err,userTopics){
			res.jsonp(userTopics);
		});
});
      
app.post('/update',function(req,res){
			
			
			//检查编辑状态
			if(req.body.oper=="edit"){
				console.log(req.body);
				var _id=req.body._id;
				var updatecontent={
					title:req.body.title,
					zone:req.body.zone,
					zonelabel:req.body.zonelabel,
				}
				Topic.update(_id,updatecontent,function(err){
					 if(err){
						  req.flash('error',err);
						  return res.redirect('/');
					 }
					req.flash('success','修改成功！');
					console.log("修改成功");
					return res.redirect('/listdata');
				});
			}else if(req.body.oper=="del"){
				console.log(req.body);
			Topic.findByIdAndRemove({_id:req.body.id},function(err){
					 if(err){
						  req.flash('error',err);
						  return res.redirect('/');
					 }
					req.flash('success','修改成功！');
					console.log("修改成功");
					return res.redirect('/listdata');
				});
			}
      
      
  });

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

app.all('/github', isLoggedIn);
app.get("/github",user.github);
app.get("/auth/github", passport.authenticate("github",{ scope : "email"}));
app.get("/auth/github/callback",
    passport.authenticate("github",{
        successRedirect: '/github',
        failureRedirect: '/login'
    }));

app.all('/qq', isLoggedIn);
app.get("/qq",user.qq);
app.get("/auth/qq", passport.authenticate("linkedin",{}));
app.get("/auth/qq/callback",
    passport.authenticate("qq",{
        successRedirect: '/qq',
        failureRedirect: '/login'
    }));

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/login');
}
