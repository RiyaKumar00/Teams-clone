var socket = io();
var videoGrid = document.getElementById('video-grid');
var messageInputBox = document.getElementById("messageInput");
var sendButton = document.getElementById("sendMessage");
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
    console.log(userId);
    socket.emit('getNumberOfClients');
    connectToNewUser(userId, stream);
  })
})

socket.on('broadcastMessage', function(data){
  console.log(data.message);
  addChat(data);
});

socket.on('user-disconnected', userId => {
  socket.emit('getNumberOfClients');
  if (peers[userId]) peers[userId].close();
})

socket.on('numberOfClients', function(clientCount){
  console.log(clientCount);
  adjustVideoSize(clientCount-1);
})

myPeer.on('open', id => {
  socket.emit('getNumberOfClients');
  socket.emit('join-room', ROOM_ID, id)
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
  videoGrid.append(video)
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
    'username': username
  }, ROOM_ID);
  messageInput.value='';
}
