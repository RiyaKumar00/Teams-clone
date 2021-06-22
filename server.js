const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

var user;

app.get('/', function(req,res){
  res.sendFile(__dirname +"/index.html");
})

app.post('/', function(req,res){
  user = req.body.username;
  console.log("USERNAME: "+user);
  res.redirect("/user/"+user);
})

app.get('/user/:username',function(req,res){
  res.render("home", {userName: user})
})

app.get('/user/:username/joinCall',function(req,res){
  res.render("join", {userName: user});
})

app.post('/user/:username/joinCall',function(req,res){
  res.redirect('/user/' + user + '/joinCall');
})

app.post('/user/:username/startCall',function(req,res){
  res.send("START " + user);
})

app.post('/user/:userName/incall', function(req,res){
  var joinMeetingLink = req.body.meetingLink;
  res.send(user + " is in a call now. Meeting LINK: " + joinMeetingLink);
})

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is running on port 3000.")
})
