var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

var dbUrl = 'mongodb://user:userpw@ds131137.mlab.com:31137/demonode';

var Message = mongoose.model('Message', {
  name: String,
  message: String
});

//var messages = [
//  {name:'Bulle', message:'Hi'},
//  {name:'Jack', message:'Yip'}
//];

app.get('/messages', function(req,res) {
  Message.find({},function(err, messages){
    res.send(messages);
  });
  //res.send(messages);  
});

app.post('/messages', function(req,res) {
  //console.log("req body:"+req.body);
  var message = new Message(req.body);
  
  message.save(function(err){
    if (err) { sendStatus(500); }
    else {
      //messages.push(req.body);
      
      Message.findOne({message:'badword'}, function(err,censored) {
          if(censored) {
            console.log('censored word found:', censored);
            Message.remove({_id:censored.id}, function(err){
              console.log('removed censored message');
            });
          }
      });
      io.emit('message', req.body);
      res.sendStatus(200);
    }
  });
});

io.on('connection', function(socket){
  console.log('a user connected');
});

//mongoose.connect(dbUrl, {useMongoClient:true}, function(err){
mongoose.connect(dbUrl, function(err){
  console.log('mongoDB connected', err);
});

//var server = app.listen(3000, function(){
//  console.log("server is listening on port ", server.address().port);
//}); // ersätts av nedan
var server = http.listen(3000, function(){
  console.log("server is listening on port ", server.address().port);
});

