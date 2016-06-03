  var mongoose=require('mongoose');
 var Schema=mongoose.Schema;
 var objectId = Schema.ObjectId;
 var autoIncrement = require('mongoose-auto-increment');   //自增ID 模块
    autoIncrement.initialize(mongoose.connection);   //初始化
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
  var replySchema = new Schema({//暂时只提供 基本评论功能 楼层 评论人 被评论的话题ID 评论的时间 评论的内容 
  content: { type: String },//1
  topic_id: { type: String, index: true },//2
  author_id: { type: String },//3 学号
  author:{type:String},//4
  reply_id : { type: String },
  replyname:{type:String},
  floor:{type:Number,default: 0},//
  create_at: { type: String, default: time.minute },//5
  update_at: { type: String, default: time.minute }
  
});
replySchema.plugin(autoIncrement.plugin, {
    model: 'Reply',   //数据模块，需要跟同名 x.model("Books", BooksSchema);
    field: 'floor',     //字段名
    startAt: 0,    //开始位置，自定义
    incrementBy: 1    //每次自增数量
});
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
		  visit_count: { type: Number, default: 0 },
		  reply_count:{ type: Number, default: 0 },
		  comments:[replySchema]//注意数据库的设计问题
  }
  );

 var activitySchema=new Schema({
	 id:String,
	 title:String,
	 start:String,
	 end:String,
	 className:String,
	 builder:String,//发起者
	 event:String,//事件内容
	 favorer:[],//投票者
	 objector:[],//反对者
	 hits:{type:Number,default: 0},//围观数
	 allDay:{
		 type:Boolean,
		 default:true
	 } 
 });

 exports.User=mongoose.model('User',userSchema);
 exports.Topic=mongoose.model('Note',topicSchema);
exports.Reply=mongoose.model('Reply',replySchema);
exports.Activity=mongoose.model('Activity',activitySchema);