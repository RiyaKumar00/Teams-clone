// JAVASCRIPT FILE FOR IN-CALL FUNCTIONS

// Getting the required elemenets by thier IDs
var cameraButton = document.getElementById("cameraButton");
var micButton = document.getElementById("micButton");
var linkSpace = document.getElementById("linkSpace");
var copyStatus = document.getElementById("copiedSuccess");
var chatBox = document.getElementById("liveChat");
var controls = document.getElementById("controls-panel");
var chats = document.getElementById("output");
var chatWindow = document.getElementById("chat-window");
var clientVideoGrid = document.getElementById("video-grid");
var videoFrame = document.getElementById("video-frame");
var width;

// Adding pre-existing chats from our database in the on-call chat.
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
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Navbar dashboard button function
function goToDashboard() {
  var loc = '/dashboard/' + userID;
  location.href = loc;
}

// End call function
function endCall() {
  var loc = '/' + userID + '/' + ROOM_ID;
  location.href = loc;
}

// Changing the call controls according to the pre-joining controls by the user
function preControls() {
  console.log(videoPrecontrol);
  console.log(audioPrecontrol);
  if (videoPrecontrol == 'false') {
    playPause();
  }
  if (audioPrecontrol == 'false') {
    muteUnmute();
  }
}

// Play User Video Stream / Pause User Video Stream toggle function
function playPause() {
  if (userStream.getVideoTracks()[0].enabled) {
    userStream.getVideoTracks()[0].enabled = false;
    cameraButton.style.backgroundImage = 'url("/images/videocam_off.png")';
  } else {
    userStream.getVideoTracks()[0].enabled = true;
    cameraButton.style.backgroundImage = 'url("/images/videocam.png")';
  }
}

// Play User Audio Stream / Pause User Audio Stream toggle function
function muteUnmute() {
  if (userStream.getAudioTracks()[0].enabled) {
    userStream.getAudioTracks()[0].enabled = false;
    micButton.style.backgroundImage = 'url("/images/mic_off.png")';
  } else {
    userStream.getAudioTracks()[0].enabled = true;
    micButton.style.backgroundImage = 'url("/images/mic.png")';
  }
}

// Show or Hide on-call team chat toggle function
function showHideChat() {
  if (chatBox.classList.contains("hidden")) {
    chatBox.classList.remove("hidden");
    clientVideoGrid.classList.add("open-chat-video");
    if (window.innerWidth < 700) {
      clientVideoGrid.style.gridTemplateColumns = "repeat(1, " + width + "vw)";
      videoFrame.classList.add("open-chat-video");
    }
  } else {
    chatBox.classList.add("hidden");
    clientVideoGrid.classList.remove("open-chat-video");
    videoFrame.classList.remove("open-chat-video");
    if (window.innerWidth < 700) {
      clientVideoGrid.style.gridTemplateColumns = "repeat(4, " + width + "vw)";
    }
  }
}

// Copy team ID when in-call to add members function
function copyLink() {
  navigator.clipboard.writeText(ROOM_ID);
  copyStatus.innerHTML = "Copied!";
}

// function to remove the copied! status after closing the modal
function clearCopied() {
  copyStatus.innerHTML = "";
}

// function to add chats in the on-call team chat window
function addChat(data) {
  if (data.username == username) {
    chats.innerHTML += '<p class="from-self">' + data.username + '</p><p class="self-message">' + data.message + '</p>';
  } else {
    chats.innerHTML += '<p class="chat-from">' + data.username + '</p><p class="chat-message">' + data.message + '</p>';
  }
  updateScroll();
}

// function to scroll to bottom of the chat screen each time a new chat is added.
function updateScroll() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
