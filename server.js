const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const { v4: uuidv4 } = require('uuid');
const socket = require('socket.io');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

var user;

app.get('/', function(req,res){
  res.render('index');
})

app.post('/', function(req,res){
  user = req.body.username;
  console.log("USERNAME: "+user);
  res.redirect("/user/"+user);
})

app.get('/user/:username',function(req,res){
  res.render("home", {userName: user})
})

app.post('/user/:username/joinCall',function(req,res){
  res.render("join", {userName: user});
})

app.post('/user/:username/startCall',function(req,res){
  var roomID = uuidv4();
  res.redirect(`/${roomID}`);
})

app.get('/:roomID', function(req,res){
  res.render('room', {userName: user, roomId: req.params.roomID});
})

app.post('/user/:userName/incall', function(req,res){
  var joinMeetingLink = req.body.meetingLink;
  res.redirect(joinMeetingLink);
})

var server = app.listen(process.env.PORT || 3000, function(){
  console.log("Server is running on port 3000.")
})

// SOCKET CONNECTION - VIDEO CALL FUNCTIONALITY

var io = socket(server);

io.on('connection', function(socket){
  console.log("user connected: " + socket.id);

  socket.on('join', function(roomName){
    var rooms = io.sockets.adapter.rooms;
    var room = rooms.get(roomName);
    if(room == undefined){
      socket.join(roomName);
      socket.emit('created');
    }
    else if(room.size==1){
      socket.join(roomName);
      socket.emit('joined');
    }
    else{
      socket.emit('full');
    }
    console.log(rooms);
  });

  socket.on('ready', function(roomName){
    socket.broadcast.to(roomName).emit("ready");
  });

  socket.on('candidate', function(candidate, roomName){
    console.log(candidate);
    socket.broadcast.to(roomName).emit("candidate", candidate);
  });

  socket.on('offer', function(offer, roomName){
    socket.broadcast.to(roomName).emit("offer", offer);
  });

  socket.on('answer', function(answer, roomName){
    socket.broadcast.to(roomName).emit("answer", answer);
  });

})
