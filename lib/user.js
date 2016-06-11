
var corpID = require('./config').corpID;
var corpSecret = require('./config').corpSecret;

var getToken = require('./token').getToken;
var http=require('http');
var request = require('request');

function getUserId(code){
  return getToken(corpID, corpSecret).then(function(res){
    var token = res.access_token;
    return new Promise(function(resolve, reject){
	var data={
	auth_code:code
	}
 
	var path="/cgi-bin/service/get_login_info?access_token="+token; 
	data = JSON.stringify(data); 
	var url='https://qyapi.weixin.qq.com/cgi-bin/service/get_login_info?access_token='+token;
	var opts={
	method:"POST",
	url:url,
	json:true,
	body:{auth_code:code},
	headers: {  
            "Content-Type": 'application/json' 
        }  
};
	console.log(opts);
 request(opts,function(err,res,data){
	console.log(data);
	resolve(data);
        });
    });
  }).catch(function(err){
    console.log(err);
  });  
}

function getMemId(code){
  return getToken(corpID, corpSecret).then(function(res){
    var token = res.access_token;
    return new Promise(function(resolve, reject){
	var aurl='https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token='+token+"&code="+code;
	console.log('请求userid',aurl);
 request(aurl,function(err,res,data){
	console.log('userid获取问题',data);
	var directurl="http://www.ssforum.top/auth/wscallback?code="+code+"&state=state";
	resolve(JSON.parse(data));

});
    });
  }).catch(function(err){
    console.log(err);
  });  
}

function getUserInfo(userid){
  return getToken(corpID, corpSecret).then(function(res){
    var token = res.access_token;
    return new Promise(function(resolve, reject){
 
	var uurl='https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token='+token+"&userid="+userid;
 request(uurl,function(err,res,data){
	var json=JSON.parse(data);
	console.log('获取到的用户信息',json);
	resolve(json); });
    });
  }).catch(function(err){
    console.log(err);
  });  
}
module.exports = {
  getUserId:getUserId,
getMemId:getMemId,
getUserInfo:getUserInfo
};
