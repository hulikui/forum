	var express = require('express')
	    , routes = require('./routes')
	    , user = require('./routes/user')
	    , http = require('http')
	    , path = require('path')
		,url=require('url')
		,flash=require('express-flash')
	    , app = express()
		,fs=require('fs')
		,crypto=require('crypto')
		,querystring=require('querystring')
		,markdown = require('markdown').markdown
		,getUserId=require('./lib/user').getUserId
		,getMemId=require('./lib/user').getMemId
		,getUserInfo=require('./lib/user').getUserInfo;
	var passport = require('passport')
	    , LocalStrategy = require('passport-local').Strategy
	    , GithubStrategy = require('passport-github').Strategy
	    ,qqStrategy=require('passport-qq').Strategy
	    ,wechatStrategy=require('passport-wechat-enterprise').Strategy
	    //,wechatStrategy=require('passport-wechat-public').Strategy
	app.set('port', process.env.PORT || 80);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	//定义数据解析器
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser())
	app.use(express.session({
		secret: 'www.ssforum.top', 
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
	passport.use("wechat",new wechatStrategy({
	    corpId: "wx1d3765eb45497a18",
	    corpSecret: "D0FBd34TAFiGjRWvPlt348PzmC0wqf3FYi_JxJeTs7MNl-N4ht7NLkgWmagSStVE",
	    callbackURL: "http://www.ssforum.top/wechat/callback",
	    state: "state",
	    //scope: "snsapi_base"
	    usertype:'member'
	  },
	  function(profile, done) {
		console.log('创建or查找用户',profile);
		/* User.findOne({
		    'studentId': profile.UserId 
		}, function(err, user) {
		    if (err) {
			return done(err);
		    }
		    //No user was found... so create a new user with values from Facebook (all the profile. stuff)
		    if (!user) {
			user = new User({
			    
				studentId:profile.UserId	
			//now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
			});
			user.save(function(err) {
			    if (err) console.log(err);
			    return done(err, user);
			});
		    } else {
			//found user. Return
			return done(err, user);
		    }
		});
	*/
		return done(null,profile);

	},
	  function getAccessToken(cb) {  },
	  function saveAccessToken(accessToken,cb){}	
	));


	passport.use(new GithubStrategy({
	    clientID: "9ee1f7a0dba3a16c4dbf",
	    clientSecret: "5abb4c698b7f9500166531e837ff0ca73bac0bf6",
	    callbackURL: "http://121.42.52.230/auth/github/callback"
	},function(accessToken, refreshToken, profile, done) {
	    done(null, profile);
	}));
	passport.use(new qqStrategy({
	    clientID: "101315903",
	    clientSecret: "6057b33da46b42a0d09703e4bb72f684",
	    callbackURL: "http://www.ssforum.top/auth/qq/callback"
	  },
	  function(accessToken, refreshToken, profile, done) {
	   // User.findOrCreate({ qqId: profile.id }, function (err, user) {
		console.log(profile);
	       done(null, profile);
	    }));
	  

	passport.serializeUser(function (user, done) {//保存user对象

	    done(null, user);//可以通过数据库方式操作
	});

	passport.deserializeUser(function (user, done) {//删除user对象
	    done(null, user);//可以通过数据库方式操作
	});
	//app.use(isLoggedIn);
	app.get('/',function(req,res){

		console.log(process.cwd());
	    res.render('index',{
	    user:req.user
	});
	});
	app.get('/login',function(req,res){

	    res.render('login',{
		message:req.flash('error') ,
		title:'北京大学软件与微电子学院校园论坛'
	    });
	});
	app.get('/userInfo',function(req,res){
			var name= req.user.username || req.user.name;
			User.findOne({username:name },function(err,userInfos){
				if(err){
					console.log(err);
					return res.redirect('/userInfo');
				}
				if(userInfos.gender=="1"){
					userInfos.gender='男';
				}else{
					userInfos.gender='女';
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
		  Topic.findOne({_id:req.params.id},function(err,topic){
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
		  Topic.update({_id:req.params.id},updateInfo,function(err){
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
				author:req.user.username||req.user.name,
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
			 author:req.user.username||req.user.name,
			 author_id:req.user.studentId
			 
		 });
		 console.log('回复的内容：',reply);
		
		 Topic.update({_id:topicID}, {$push: {comments: reply}}, {upsert:true},function(err){
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
				builder:req.user.username||req.user.name,
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
				return res.redirect('/calendars');
			});
			
	 });
	  app.post('/updateCalEvent/:_id',function(req,res)//app.post('/flow/save', require('body-parser').json(), traffic);
	  {     var id=req.body.id;
			//要用对象去匹配ID
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
	   
	    Topic.find({author:req.user.name||req.user.username}).exec(function(err,userTopics){
				
				
				
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
			 Topic.find({author:req.user.name||req.user.username}).exec(function(err,userTopics){
				res.jsonp(userTopics);
			});
	});
	      
	app.post('/update',function(req,res){
				
				
				//检查编辑状态
				if(req.body.oper=="edit"){
					console.log(req.body);
					var id=req.body._id;
					var updatecontent={
						title:req.body.title,
						zone:req.body.zone,
						zonelabel:req.body.zonelabel,
					}
					Topic.update({_id:id},updatecontent,function(err){
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

//	app.all('/wechat', isLoggedIn);
	app.get("/wechat",user.wechat);

	app.get("/auth/wscallback",function(req,res){
		var Url=url.parse(req.url).query;
		//console.log(Url);
		var str = querystring.parse(Url);
		//console.log(str);
		var code=str.code;
		console.log('code',code);
		getMemId(code).then(function(userid){
		getUserInfo(userid.UserId).then(function(userInfo){
		console.log('微信手机客户端获取到的用户信息');
		
		req.logIn(userInfo,function(err){
			console.log('已被加入req.user',req.user);
		
		
		var sessionid=req.cookies['connect.sid']||req.cookies.connect.sid;
		var id=sessionid.replace(/[&\|\\\\/*!$()^%$#,@\:;.-]/g,"");
		console.log('sessonid',id);
		var filename="/root/Code/sessions";
		console.log(req.session);

		/*var ss={
		userid:userInfo.userid,
		username:userInfo.name,
		avatar:userInfo.avatar
}             */
		sessionStore(filename,id,req.user);
		if (err) { console.log(err) }
		findorcreate(userInfo,req,res);
});

	});

});
});
	app.get("/auth/wechat/callback",function(req,res){
		
		
		var Url=url.parse(req.url).query;
		//console.log(Url);
		var str = querystring.parse(Url);
		//console.log(str);
		var code=str.auth_code;
		//console.log(code);
		getUserId(code).then(function(userId){
		var userInfo=userId.user_info;
		console.log('获取的微信用户信息',userInfo);
		req.logIn(userInfo,function(err){
		
		var sessionid=req.cookies['connect.sid']||req.cookies.connect.sid;
		var id=sessionid.replace(/[&\|\\\\/*!$()^%$#,@\:;.-]/g,"");
		console.log('sessonid',id);
		var filename="/root/Code/sessions";
		console.log(req.session);

		var ss={
		userid:userInfo.userid,
		username:userInfo.name,
		avatar:userInfo.avatar
}             
		console.log('自建session',ss);
		sessionStore(filename,id,ss);
		if (err) { console.log(err) }
		findorcreate(userInfo,req,res);
});
});
});
app.get("/auth/wechat",function(req,res){
		const params={};
		 params['appid'] = "wx1d3765eb45497a18";
	  params['redirect_uri'] = "http://www.ssforum.top/auth/wscallback";
	  params['response_type'] = 'code';
	  params['scope'] = 'snsapi_base';
	  params['state'] = 'state';
	  var authurl="https://open.weixin.qq.com/connect/oauth2/authorize" + '?' + querystring.stringify(params)+"#wechat_redirect";
	console.log("微信手机跳转",authurl);
	res.redirect(authurl,302);
});
app.get("/wechat/callback",
    passport.authenticate("wechat",{
	failureRedirect: '/' ,
	successRedirect:'/wechat'
})
);
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
app.get("/auth/qq", passport.authenticate("qq",{scope:"all"}));
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

function findorcreate(userInfo,req,res){ 
	if(userInfo){
		User.findOne({ studentId: userInfo.userid }, function(err, user) {
		    if (err) {
			return done(err);
		    }
		    if (!user) {
			var newuser = new User({
			    	tel:userInfo.mobile,
				gender:userInfo.gender,
				studentId:userInfo.userid,
				username:userInfo.name,
				weixinid:userInfo.weixinid
					
			});
			newuser.save(function(err,doc) {
			    if (err) console.log(err);
				console.log('新用户登录');
			    return res.redirect('/users');
			});
		    } else {
			//found user. Return
			
			console.log('老用户登录');
		       res.redirect('/users');
		    }
		});
}}

function sessionStore(filename,sessionId, session){
	var sessionPath=path.join(filename, sessionId + '.json');//要保存的文件地址 
	 var json = JSON.stringify(session);//要保存的信息
	console.log('解析的json数据',json);
	fs.writeFile(sessionPath,json, function (err) {
   if (err) throw err;
   console.log('It\'s saved!');
 });
 }
