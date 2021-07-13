// JAVASCRIPT FOR SOCKET COMMUNICATION WHILE ON TEAM CHAT
// Initializing the socket
var socket = io();
// Getting the required elements by their IDs
var messageInputBox = document.getElementById("messageValue");
var sendButton = document.getElementById("sendMessage_button");
var chats = document.getElementById("chatDisplay");
var copyStatus = document.getElementById("copiedSuccess");

// Loading the pre-existing chats from our database into the chat display
document.addEventListener('DOMContentLoaded', function() {
  teams.forEach(function(team) {
    if (team.teamID == ROOM_ID) {
      team.chats.forEach(function(chat) {
        const data = {
          message: chat.message,
          username: chat.senderName,
          userID: chat.senderID
        }
        addChat(data);
      });
    }
  })
  // Emit to server that a new socket wants to join
  socket.emit('join-room', ROOM_ID);
});

// When server sends a new chat message in the room
socket.on('broadcastMessage', function(data) {
  console.log(data.message);
  // Add chat in the chat display
  addChat(data);
});

// When server sendes the email status on schdeuling a meeting
socket.on('emailStatus', function(data) {
  if (data.status == 'Sent') {
    alert("Meeting Schedule has been sent to the team members.")
  } else {
    alert("An error occured while sending Meeting Schedule. Please contact the admin for help.");
  }
})

// Function to enable send message on pressing enter key
messageInputBox.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    sendButton.click();
  }
});

// Function to emit the sent message to the server.
function emitMessage() {
  socket.emit('sendingMessage', {
    'message': messageInputBox.value,
    'username': username,
    'userID': userID
  }, ROOM_ID);
  messageInputBox.value = '';
}

// Function to add a chat in the chat display
function addChat(data) {
  if (data.userID == userID) {
    chats.innerHTML += '<p class="sent sender">' + data.username + '</p><p class="sent message">' + data.message + '</p>';
  } else {
    chats.innerHTML += '<p class="received sender">' + data.username + '</p><p class="received message">' + data.message + '</p>';
  }
  updateScroll();
}

// function to scroll to bottom of the chat screen each time a new chat is added.
function updateScroll() {
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// function to copy team ID on add user
function copyLink() {
  navigator.clipboard.writeText(ROOM_ID);
  copyStatus.innerHTML = "Copied!";
}

// function to remove the copied! status after closing the modal
function clearCopied() {
  copyStatus.innerHTML = "";
}

// Navbar dashboard button function
function goToDashboard() {
  var loc = '/dashboard/' + userID;
  location.href = loc;
}

// Function when user wants to schedule a future call and send invite
function scheduleCall() {
  // Getting the required elemenets by their ID
  var meetingTitle = document.getElementById("titleInput").value;
  var meetingDate = document.getElementById("dateInput").value;
  var meetingTime = document.getElementById("timeInput").value;
  // Checking if any field is empty
  if (meetingTitle == '') {
    alert("Meeting Title can not be empty!")
  } else if (meetingDate == '') {
    alert("Please select a meeting date.")
  } else if (meetingTime == '') {
    alert("Please select a meeting time.")
  } else {
    // If no field is empty, emit to server that the user wants to send a mail with the given details
    socket.emit('sendMeetingInvite', {
      scheduledBy: username,
      meetingTitle: meetingTitle,
      meetingDate: meetingDate,
      meetingTime: meetingTime
    }, ROOM_ID);
  }
}
