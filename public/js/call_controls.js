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

document.addEventListener('DOMContentLoaded',function(){
  teams.forEach(function(team){
    if(team.teamID == ROOM_ID){
      team.chats.forEach(function(chat){
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

function goToDashboard(){
  var loc = '/dashboard/' + userID;
  location.href= loc;
}

function endCall(){
  var loc = '/'+ userID + '/' + ROOM_ID;
  location.href = loc;
}

function preControls(){
  console.log(videoPrecontrol);
  console.log(audioPrecontrol);
  if(videoPrecontrol == 'false'){
    playPause();
  }
  if(audioPrecontrol == 'false'){
    muteUnmute();
  }
}

function playPause(){
  if(userStream.getVideoTracks()[0].enabled){
    userStream.getVideoTracks()[0].enabled = false;
    cameraButton.style.backgroundImage = 'url("/images/videocam_off.png")';
  }
  else{
    userStream.getVideoTracks()[0].enabled = true;
    cameraButton.style.backgroundImage = 'url("/images/videocam.png")';
  }
}

function muteUnmute(){
  if(userStream.getAudioTracks()[0].enabled){
    userStream.getAudioTracks()[0].enabled = false;
    micButton.style.backgroundImage = 'url("/images/mic_off.png")';
  }
  else{
    userStream.getAudioTracks()[0].enabled = true;
    micButton.style.backgroundImage = 'url("/images/mic.png")';
  }
}

function showHideChat(){
  if(chatBox.classList.contains("hidden")){
    chatBox.classList.remove("hidden");
    clientVideoGrid.classList.add("open-chat-video");
    if(window.innerWidth<700){
      clientVideoGrid.style.gridTemplateColumns = "repeat(1, " + width + "vw)";
      videoFrame.classList.add("open-chat-video");
    }
  }
  else{
    chatBox.classList.add("hidden");
    clientVideoGrid.classList.remove("open-chat-video");
    videoFrame.classList.remove("open-chat-video");
    if(window.innerWidth<700){
      clientVideoGrid.style.gridTemplateColumns = "repeat(4, " + width + "vw)";
    }
  }
}

function copyLink(){
  navigator.clipboard.writeText(ROOM_ID);
  copyStatus.innerHTML = "Copied!";
}

function clearCopied(){
  copyStatus.innerHTML = "";
}

function addChat(data){
  if(data.username == username){
    chats.innerHTML += '<p class="from-self">'+data.username+'</p><p class="self-message">'+data.message+'</p>';
  }
  else{
    chats.innerHTML += '<p class="chat-from">'+data.username+'</p><p class="chat-message">'+data.message+'</p>';
  }
  updateScroll();
}

function updateScroll(){
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
