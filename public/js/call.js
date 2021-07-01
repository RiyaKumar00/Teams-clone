const socket = io();
const videoGrid = document.getElementById('video-grid');
var userStream;
const myPeer = new Peer();
const myVideo = document.createElement('video')
const peers = {}
var clientNumber = 1;
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
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    console.log(userId);
    clientNumber++;
    // adjustVideoSize();
    connectToNewUser(userId, stream);
  })
})

socket.on('broadcastMessage', function(data){
  console.log(data.message);
  addChat(data);
});

socket.on('user-disconnected', userId => {
  clientNumber--;
  // adjustVideoSize();
  if (peers[userId]) peers[userId].close();
})

myPeer.on('open', id => {
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

function emitMessage(){
  socket.emit('sendingMessage', {
    'message': messageInput.value,
    'username': username
  }, ROOM_ID);
  message.value='';
}
