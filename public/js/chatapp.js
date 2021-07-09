var socket = io();
var messageInputBox = document.getElementById("messageValue");
var sendButton = document.getElementById("sendMessage_button");
var chats = document.getElementById("chatDisplay");
var copyStatus = document.getElementById("copiedSuccess");

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
  socket.emit('join-room', ROOM_ID);
});

socket.on('broadcastMessage', function(data){
  console.log(data.message);
  addChat(data);
});

messageInputBox.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
     event.preventDefault();
     sendButton.click();
  }
});

function emitMessage(){
  socket.emit('sendingMessage', {
    'message': messageInputBox.value,
    'username': username,
    'userID': userID
  }, ROOM_ID);
  messageInputBox.value='';
}

function addChat(data){
  if(data.userID == userID){
    chats.innerHTML += '<p class="sent sender">'+data.username+'</p><p class="sent message">'+data.message+'</p>';
  }
  else{
    chats.innerHTML += '<p class="received sender">'+data.username+'</p><p class="received message">'+data.message+'</p>';
  }
  updateScroll();
}

function updateScroll(){
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function copyLink(){
  navigator.clipboard.writeText(ROOM_ID);
  copyStatus.innerHTML = "Copied!";
}

function clearCopied(){
  copyStatus.innerHTML = "";
}

function goToDashboard(){
  var loc = '/dashboard/' + userID;
  location.href= loc;
}
