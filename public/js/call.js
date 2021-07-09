var socket = io();
var videoGrid = document.getElementById('video-grid');
var messageInputBox = document.getElementById("messageInput");
var sendButton = document.getElementById("sendMessage_button");
var userStream;
var myPeer = new Peer();
var myVideo = document.createElement('video')
var peers = {}
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  userStream = stream;
  preControls();
  addVideoStream(myVideo, stream);
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream);
  })
})

socket.on('broadcastMessage', function(data){
  console.log(data.message);
  addChat(data);
});

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
})

socket.on('numberOfClients', function(clients){
  peer = clients;
  console.log(clients.length);
})

myPeer.on('open', id => {
  socket.emit('join-call', ROOM_ID, id);
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video);
}

messageInputBox.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
     event.preventDefault();
     sendButton.click();
  }
});

function emitMessage(){
  socket.emit('sendingMessage', {
    'message': messageInput.value,
    'username': username,
    'userID': userID
  }, ROOM_ID);
  messageInput.value='';
}
