// Requiring the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const {
  v4: uuidv4
} = require('uuid');
const mongoose = require('mongoose');
const socket = require('socket.io');
const sgMail = require('@sendgrid/mail')
require('dotenv').config();

//Setting API Key for sendGrid Mail API
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Declaring variables
const PORT = process.env.PORT || 3000;
const app = express();
var numClients = {};

// Configuration of application
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

// mongodb://localhost:27017
//Connecting to mongodb Atlas DB server
var mongodb_connection = "mongodb+srv://" + process.env.mongo_Atlas_username + ":" + process.env.mongo_Atlas_pass + "@clusterteamsclone.iebjk.mongodb.net/userDB";

mongoose.connect(mongodb_connection, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Defining Schemas
const chatSchema = {
  message: String,
  senderName: String,
  senderID: String
};

const teamSchema = {
  teamName: String,
  teamID: String,
  members: [String],
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

// Adding collections in Database
const User = new mongoose.model("User", userSchema);
const Teams = new mongoose.model("teamList", teamSchema);
const Chats = new mongoose.model("chatList", chatSchema);

// **************************************************************** EXPRESS ROUTING (GET) ****************************************************************
app.get('/', function(req, res) {
  // Rendering home page
  res.render('home', {
    loginStatus: ''
  });
})

app.get('/register', function(req, res) {
  // Rendering registration page
  res.render('register', {
    status: ''
  });
})

app.get('/dashboard/:userID', function(req, res) {
  // Checking if User exists - to prevent hard routes from loading
  User.findOne({
    _id: req.params.userID
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        // Rendering Dashboard
        res.render('dashboard', {
          user: foundUser
        });
      } else {
        // Redirecting to login page
        res.redirect('/');
      }
    }
  });
})

app.get('/:userID/createTeam', function(req, res) {
  // Rendering create team page
  res.render('createTeam', {
    userId: req.params.userID
  });
})

app.get('/:userID/joinTeam', function(req, res) {
  // Rendering join team page
  res.render('joinTeam', {
    userId: req.params.userID,
    joinStatus: ''
  });
})

app.get('/:userID/:teamID', function(req, res) {
  // Checking if user exists - to prevent hard routes
  User.findOne({
    _id: req.params.userID
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      var callStatus;
      // Checking the current call status for that team
      if (numClients[req.params.teamID]) {
        if (numClients[req.params.teamID].length == 0) {
          callStatus = 'START CALL';
        } else {
          callStatus = 'JOIN CALL';
        }
      } else {
        callStatus = 'START CALL';
      }
      if (foundUser) {
        // Checking if team exists- to prevent hard routes
        Teams.findOne({
          teamID: req.params.teamID
        }, function(err, foundTeam) {
          if (err) {
            console.log(err);
          } else {
            // Rendering Team Dashboard
            res.render('teamTemplate', {
              user: foundUser,
              team: foundTeam,
              callStatus: callStatus
            });
          }
        })
      } else {
        // Redirecting to login page
        res.redirect('/');
      }
    }
  });
})

app.get('/:userID/:teamID/call', function(req, res) {
  // Checking if user exists - to prevent hard routes
  User.findOne({
    _id: req.params.userID
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        // Checking if team exists - to prevent hard routes
        Teams.findOne({
          teamID: req.params.teamID
        }, function(err, foundTeam) {
          if (err) {
            console.log(err);
          } else {
            // Rendering call room
            res.render('room', {
              user: foundUser,
              team: foundTeam,
              roomID: req.params.teamID,
              audio: req.query.audio,
              video: req.query.video
            });
          }
        })
      } else {
        // Redirecting to login page
        res.redirect('/');
      }
    }
  })
})

// **************************************************************** EXPRESS ROUTING (POST) ****************************************************************

app.post('/', function(req, res) {
  var email = req.body.emailID;
  var password = req.body.password;
  // Checking if user exists - to prevent hard routes
  User.findOne({
    email: email
  }, function(err, foundUser) {
    if (err) {
      res.render('home', {
        loginStatus: "Unknown error. Please try again later or contact the admin."
      })
      console.log(err);
    } else {
      if (foundUser) {
        // Checking if the password entered matches with the password stored in our database
        if (foundUser.password == password) {
          // Renering dashboard if password is correct
          res.redirect('/dashboard' + `/${foundUser._id}`);
        } else {
          // Notifying user if password does not match
          res.render('home', {
            loginStatus: "Incorrect email ID or password. Please try again."
          })
        }
      } else {
        // Notifying user if they need to register
        res.render('home', {
          loginStatus: "User not found."
        })
      }
    }
  });
});

app.post('/register', function(req, res) {
  var email = req.body.emailID;
  // Checking if the user already exixts
  User.findOne({
    email: email
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        // If user exists, notify them to login
        res.render('register', {
          status: 2
        });
      } else {
        // If user does not exist, create a new user
        const newUser = new User({
          // Setting user details from the registeration form
          name: req.body.fullName,
          email: req.body.emailID,
          password: req.body.password,
          organization: req.body.organization,
          mobileNumber: req.body.mobileNumber
        });

        // Saving the new user
        newUser.save(function(err) {
          if (err) {
            console.log(err);
          } else {
            // Notifying the user that they have successfully registered
            res.render('register', {
              status: 1
            });
          }
        });
      }
    }
  });
});

// Creating a new team
app.post('/:userID/createTeam', function(req, res) {
  var teamName = req.body.teamName;
  var teamID = uuidv4();

  // Setting team details as entered by the user
  const newTeam = new Teams({
    teamName: teamName,
    teamID: teamID,
  });

  // Saving the new team
  newTeam.save(function(err) {
    if (err) {
      console.log(err);
    }
  });

  /Finding the user in our database/
  User.findOne({
    _id: req.params.userID
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        // Updating the teamlist to add the user as a memeber of the team for mailing list
        Teams.updateOne({
          teamID: newTeam.teamID
        }, {
          $push: {
            "members": foundUser.email
          }
        }, function(err) {
          if (err) {
            console.log(err);
          }
        });
      } else {
        console.log("User not found");
      }

    }
  })

  // Updating the user database to add the team in the teams list of the user
  User.updateOne({
    _id: req.params.userID
  }, {
    $push: {
      "teams": newTeam
    }
  }, function(err) {
    if (err) {
      console.log(err);
    } else {
      // Redirectign to the dashboard
      res.redirect('/dashboard' + `/${req.params.userID}`);
    }
  });
});

app.post('/:userID/joinTeam', function(req, res) {
  var teamID = req.body.teamID;

  // Checking if the team exists
  Teams.findOne({
    teamID: teamID
  }, function(err, foundTeam) {
    if (err) {
      console.log(err);
    } else {
      if (foundTeam) {
        // Checking if the user exists - to prevent hard routing
        User.findOne({
          _id: req.params.userID
        }, function(err, foundUser) {
          if (err) {
            console.log(err);
          } else {
            if (foundUser) {
              // CHecking if the user is already a member of that team
              var alreadyMember = false;
              foundUser.teams.forEach(function(team) {
                console.log(team.teamID);
                if (team.teamID == teamID) {
                  alreadyMember = true;
                }
              });
              if (alreadyMember) {
                // If user is already a memeber of the team, Redirect to dashboard
                res.redirect('/dashboard' + `/${req.params.userID}`);
              } else {
                // If user is not a memeber of the team, update the teamlist and user DB and then redirect to dashboard
                Teams.updateOne({
                  teamID: foundTeam.teamID
                }, {
                  $push: {
                    "members": foundUser.email
                  }
                }, function(err) {
                  if (err) {
                    console.log(err);
                  }
                })
                User.updateOne({
                  _id: req.params.userID
                }, {
                  $push: {
                    "teams": foundTeam
                  }
                }, function(err) {
                  if (err) {
                    console.log(err);
                  } else {
                    res.redirect('/dashboard' + `/${req.params.userID}`);
                  }
                });
              }
            }
          }
        });
      } else {
        // If team does not exist, Notify the user that the team ID entered is invalid
        res.render('joinTeam', {
          userId: req.params.userID,
          joinStatus: 'Team does not exit. Please enter a valid Team ID.'
        })
      }
    }
  });
});

// When user attempts to start/join a call
app.post('/:userID/:teamID', function(req, res) {
  var callID = req.params.teamID;
  // Check if the user want to join the call with video and mic on/off
  var audio = Boolean(req.body.audioControl);
  var video = Boolean(req.body.videoControl);

  // Redirect to the call room
  res.redirect(`/${req.params.userID}` + `/${callID}` + '/call?audio=' + audio + '&video=' + video);
});

// Server listening on PORT
var server = app.listen(PORT, function() {
  console.log("Server is running on port " + PORT);
})

// *********************************************************** SOCKET CONNECTIONS FOR CHAT AND CALL ***********************************************************

// Initializing the socket
var io = socket(server);

// Socket connection
io.on('connection', function(socket) {
  // On socket join-call
  socket.on('join-call', (roomID, userId) => {
    socket.join(roomID)

    // Update number of Clients for that room (Number of users on call)
    if (numClients[roomID] == undefined) {
      numClients[roomID] = [userId];
    } else {
      numClients[roomID].push(userId);
    }
    console.log("user connected: " + socket.id);
    // Emit to room that user is connected
    socket.to(roomID).emit('user-connected', userId);

    // When socket disconnects
    socket.on('disconnect', () => {
      // Update number of Clients for that room (Number of users on call)
      numClients[roomID].splice(numClients[roomID].indexOf(userId));
      console.log("user disconnected: " + socket.id);
      // emit to room that user disconnected
      socket.to(roomID).emit('user-disconnected', userId);
    })
  })

  // On socket join-room (Chat only)
  socket.on('join-room', (roomID) => {
    socket.join(roomID)
    console.log("user connected: " + socket.id);

    socket.on('disconnect', () => {
      console.log("user disconnected: " + socket.id);
    })
  })

  // When users send a chat
  socket.on('sendingMessage', function(data, roomID) {
    // Create new chat object
    const chat = new Chats({
      message: data.message,
      senderName: data.username,
      senderID: data.userID
    });

    // Add the chat in User database for all the users that are a memeber of the team
    User.updateMany({
      "teams.teamID": roomID
    }, {
      $push: {
        "teams.$.chats": chat
      }
    }, function(err) {
      if (err) {
        console.log(err);
      }
    });

    // Emit the message in the room for all memebers of the team
    io.sockets.in(roomID).emit("broadcastMessage", data);
  });

  // When users Schedule a Meeting
  socket.on('sendMeetingInvite', function(data, teamID) {
    // Find the team in our database to get the mailing list
    Teams.findOne({
      teamID: teamID
    }, function(err, foundTeam) {
      if (err) {
        console.log(err);
      } else {
        // Construct the mail
        const msg = {
          // Send to all the email IDs in the mailing list of that team
          to: foundTeam.members,
          // Send from our verified sender email address for this application
          from: 'teamcallsender@gmail.com', // To change this address, make sure the sender is verified with your sendgrid account
          subject: 'TeamCall: Meeting Schedule',
          html: '<h1>' + data.scheduledBy + ' Schdeuled a Meeting!</h1><br><p><strong> Title of meeting: </strong>' + data.meetingTitle + '<br><strong> Date of Meeting: </strong>' + data.meetingDate + '<br><strong> Time of Meeting: </strong>' + data.meetingTime,
        }

        // Sending the constructed mail with the help of sengGrid API
        sgMail
          .send(msg)
          .then(() => {
            // Emit to user that e-mail has been successfully sent.
            socket.emit('emailStatus', {
              status: "Sent"
            });
            console.log('Email sent to team members');
          })
          .catch((error) => {
            // Emit to user that e-mail has not been sent due to an error.
            socket.emit('emailStatus', {
              status: "Not Sent"
            });
            console.error(error);
          })
      }
    })
  });
})
