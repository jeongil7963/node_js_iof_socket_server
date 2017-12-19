var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dl = require('delivery');
var fs = require('fs');
var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');

    var delivery = dl.listen(socket);
    delivery.on('receive.success',function(file){

      var params = file.params;
      console.log("params : " + params.path);
      var cb;
      writeFile(params.path+file.name,file.buffer, cb );
      if(cb){
        console.log('File could not be saved: ' + cb);
      }else{
        console.log('File ' + file.name + " saved");
      };
    });	
    
    socket.on('chat', function(msg){
        console.log('message: ' + msg);
        io.emit(msg.user_token, msg);
      });

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });
      
http.listen(5000, function(){
  console.log('listening on *:5000');
});

function writeFile(path, contents, cb) {
  mkdirp(getDirName(path), function (err) {
    if (err) return cb(err);
    fs.writeFile(path, contents, cb);
  });
}