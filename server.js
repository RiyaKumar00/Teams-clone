const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const { v4: uuidv4 } = require('uuid');
const socket = require('socket.io');
const PORT = process.env.PORT || 3000;
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

var user;
var roomID;

app.get('/', function(req,res){
  res.render('welcome');
})

app.post('/', function(req,res){
  user = req.body.username;
  console.log("USERNAME: "+user);
  res.redirect("/user/"+user);
})

app.get('/user/:username',function(req,res){
  user = req.params.username;
  res.render("home", {userName: user})
})

app.post('/user/:username/joinCall',function(req,res){
  res.redirect('/join'+`/${req.params.username}`);
})

app.get('/join/:username', function(req,res){
  user = req.params.username;
  res.render("join", {userName: user});
})

app.post('/user/:username/startCall',function(req,res){
  roomID = uuidv4();
  res.redirect('/call'+`/${req.params.username}`+`/${roomID}`+'?audio=true&video=true');
})

app.get('/call/:user/:roomID', function(req,res){
  res.render('room', {userName: req.params.user, roomId: req.params.roomID, audio: req.query.audio, video: req.query.video});
})

app.post('/user/:username/incall', function(req,res){
  var meetingID = req.body.meetingLink;
  var audio = Boolean(req.body.audioControl);
  var video = Boolean(req.body.videoControl);
  console.log(audio);
  console.log(video);
  res.redirect('/call'+`/${req.params.username}`+`/${meetingID}`+'?audio='+audio+'&video='+video);
})

var server = app.listen(PORT, function(){
  console.log("Server is running on port " + PORT);
})

// SOCKET CONNECTION - VIDEO CALL FUNCTIONALITY

var io = socket(server);

io.on('connection', function(socket){
  console.log("user connected: " + socket.id);
  socket.on('join-room', (roomID, userId) => {
    socket.join(roomID)
    socket.to(roomID).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomID).emit('user-disconnected', userId);
    })
  })

  socket.on('sendingMessage', function(data, roomID){
    console.log(data);
    io.sockets.in(roomID).emit("broadcastMessage", data);
  })

  socket.on('getNumberOfClients', function(){
    var room = io.sockets.adapter.rooms;
    var clientCount = room.size;
    socket.to(roomID).emit('numberOfClients', clientCount);
  })
})
