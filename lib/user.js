
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

module.exports = {
  getUserId:getUserId
};
