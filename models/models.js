  var mongoose=require('mongoose');
 var Schema=mongoose.Schema;
	var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
      date : date,
      year : date.getFullYear(),
      month : date.getFullYear() + '-' +(date.getMonth()+1),
      day : date.getFullYear() + '-' +(date.getMonth()+1) + '-' + date.getDay(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
          date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
 var userSchema=new Schema(
 {
         username:String,
         password:String,
          email:String,
		  grade:String,
		  studentId:String,
          createTime:{
			type:String,
			default:time.day
		  }
 
  }
  );
  var topicSchema=new Schema(
 {		
         title:String,
         author:String,
          zonelabel:String,
		  content:String,
		  zone:String,
          createTime:{
			type:String,
			default:time.minute
		  },
		  pv:0,
		  comments:0
  }
  );
 exports.User=mongoose.model('User',userSchema);
 exports.Topic=mongoose.model('Note',topicSchema);
