const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const socket = require('socket.io');
const PORT = process.env.PORT || 3000;
const app = express();
var numClients = {};

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const chatSchema = {
  message: String,
  senderName: String,
  senderID: String
};

const teamSchema = {
  teamName: String,
  teamID: String,
  chats: [chatSchema]
}

const userSchema = {
  name: String,
  email: String,
  password: String,
  organization: String,
  mobileNumber: String,
  teams: [teamSchema],
};

const User = new mongoose.model("User", userSchema);
const Teams = new mongoose.model("teamList", teamSchema);
const Chats = new mongoose.model("chatList", chatSchema);

app.get('/', function(req,res){
  res.render('home', {loginStatus: ''});
})

app.get('/register', function(req,res){
  res.render('register', {status: ''});
})

app.get('/dashboard/:userID', function(req,res){
  User.findOne({_id: req.params.userID}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        res.render('dashboard', {user: foundUser});
      }
      else{
        res.redirect('/');
      }
    }
  });
})

app.get('/:userID/createTeam', function(req,res){
  res.render('createTeam', {userId: req.params.userID});
})

app.get('/:userID/joinTeam', function(req,res){
  res.render('joinTeam', {userId: req.params.userID, joinStatus: ''});
})

app.get('/:userID/:teamID', function(req,res){
  User.findOne({_id: req.params.userID}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      var callStatus;
      if(numClients[req.params.teamID]){
        if(numClients[req.params.teamID].length==0){
          callStatus = 'START CALL';
        }
        else{
          callStatus = 'JOIN CALL';
        }
      }
      else{
        callStatus = 'START CALL';
      }
      if(foundUser){
        Teams.findOne({teamID: req.params.teamID}, function(err, foundTeam){
          if(err){
            console.log(err);
          }
          else{
            res.render('teamTemplate', {user: foundUser, team: foundTeam, callStatus: callStatus});
          }
        })
      }
      else{
        res.redirect('/');
      }
    }
  });
})

app.get('/:userID/:teamID/call', function(req,res){
  User.findOne({_id: req.params.userID}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        Teams.findOne({teamID: req.params.teamID}, function(err, foundTeam){
          if(err){
            console.log(err);
          }
          else{
            res.render('room', {user: foundUser, team: foundTeam, roomID: req.params.teamID, audio: req.query.audio, video: req.query.video});
          }
        })
      }
      else{
        res.redirect('/');
      }
    }
  })
})

app.post('/', function(req,res){
  var email = req.body.emailID;
  var password = req.body.password;
  User.findOne({email: email}, function(err, foundUser){
    if(err){
      res.render('home', {loginStatus: "Unknown error. Please try again later or contact the admin."})
      console.log(err);
    }
    else{
      if(foundUser){
        if(foundUser.password == password){
          res.redirect('/dashboard'+`/${foundUser._id}`);
        }
        else{
          res.render('home', {loginStatus: "Incorrect email ID or password. Please try again."})
        }
      }
      else{
        res.render('home', {loginStatus: "User not found."})
      }
    }
  });
});

app.post('/register', function(req,res){
  var email = req.body.emailID;
  User.findOne({email: email}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
          res.render('register', {status: 2});
      }
      else{
        const newUser = new User({
          name: req.body.fullName,
          email: req.body.emailID,
          password: req.body.password,
          organization: req.body.organization,
          mobileNumber: req.body.mobileNumber
        });

        newUser.save(function(err){
          if(err){
            console.log(err);
          }
          else{
            res.render('register', {status: 1});
          }
        });
      }
    }
  });
});

app.post('/:userID/createTeam', function(req,res){
  var teamName = req.body.teamName;
  var teamID = uuidv4();
  const newTeam = new Teams({
    teamName: teamName,
    teamID: teamID
  });

  newTeam.save(function(err){
    if(err){
      console.log(err);
    }
  });

  User.updateOne({_id: req.params.userID}, {$push: {"teams": newTeam}}, function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect('/dashboard'+`/${req.params.userID}`);
    }
  });
});

app.post('/:userID/joinTeam', function(req,res){
  var teamID = req.body.teamID;
  Teams.findOne({teamID: teamID}, function(err, foundTeam){
    if(err){
      console.log(err);
    }
    else{
      if(foundTeam){
        User.findOne({_id: req.params.userID}, function(err, foundUser){
            if(err){
              console.log(err);
            }
            else{
              if(foundUser){
                var alreadyMember = false;
                foundUser.teams.forEach(function(team){
                  console.log(team.teamID);
                  if(team.teamID == teamID){
                    alreadyMember = true;
                  }
                });
                if(alreadyMember){
                  res.redirect('/dashboard'+`/${req.params.userID}`);
                }
                else{
                  User.updateOne({_id: req.params.userID}, {$push: {"teams": foundTeam}}, function(err){
                    if(err){
                      console.log(err);
                    }
                    else{
                      res.redirect('/dashboard'+`/${req.params.userID}`);
                    }
                  });
                }
              }
            }
          });
      }
      else{
        res.render('joinTeam', {userId: req.params.userID, joinStatus: 'Team does not exit. Please enter a valid Team ID.'})
      }
    }
  });
});

app.post('/:userID/:teamID', function(req,res){
  var callID = req.params.teamID;
  var audio = Boolean(req.body.audioControl);
  var video = Boolean(req.body.videoControl);
  res.redirect(`/${req.params.userID}`+`/${callID}`+'/call?audio='+audio+'&video='+video);
});

var server = app.listen(PORT, function(){
  console.log("Server is running on port " + PORT);
})

// SOCKET CONNECTION

var io = socket(server);

io.on('connection', function(socket){
  socket.on('join-call', (roomID, userId) => {
    socket.join(roomID)
    if (numClients[roomID] == undefined) {
        numClients[roomID] = [userId];
    } else {
        numClients[roomID].push(userId);
    }
    console.log("user connected: " + socket.id);
    socket.to(roomID).emit('user-connected', userId);

    socket.on('disconnect', () => {
      numClients[roomID].splice(numClients[roomID].indexOf(userId));
      console.log("user disconnected: " + socket.id);
      socket.to(roomID).emit('user-disconnected', userId);
    })
  })

  socket.on('join-room', (roomID) => {
    socket.join(roomID)
    console.log("user connected: " + socket.id);

    socket.on('disconnect', () => {
      console.log("user disconnected: " + socket.id);
    })
  })

  socket.on('sendingMessage', function(data, roomID){
    const chat = new Chats({
      message: data.message,
      senderName: data.username,
      senderID: data.userID
    });

    User.updateMany({"teams.teamID": roomID}, {$push: {"teams.$.chats": chat}}, function(err){
      if(err){
        console.log(err);
      }
    });

    io.sockets.in(roomID).emit("broadcastMessage", data);
  })
})
