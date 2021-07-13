// JAVASCRIPT FOR SOCKET COMMUNICATION WHILE ON A CALL
// Getting the required elements by their IDs
var socket = io();
var videoGrid = document.getElementById('video-grid');
var messageInputBox = document.getElementById("messageInput");
var sendButton = document.getElementById("sendMessage_button");
var userStream;
var myPeer = new Peer();
var myVideo = document.createElement('video')
var peers = {}

// Setting users video on mute
myVideo.muted = true;

// Getting self media stream
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  userStream = stream;
  preControls();
  // Adding self media stream to display
  addVideoStream(myVideo, stream);
  // Peer call function
  myPeer.on('call', call => {
    // Answering the peer call with the other user stream
    call.answer(stream)
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      // On getting the other users stream, adding their stream to display
      addVideoStream(video, userVideoStream)
    })
  })

  // When a new socket connects
  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream);
  })
})

// When any soket in the room emits a new chat
socket.on('broadcastMessage', function(data) {
  console.log(data.message);
  addChat(data);
});

// When a socket disconnects, closing the peer connection
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
})

// Emit to server that a socket wants to join the call on opening the peer connection
myPeer.on('open', id => {
  socket.emit('join-call', ROOM_ID, id);
})

// Function to connect to a new user
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  // Getting peer media stream
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    // Adding peer media stream to display
    addVideoStream(video, userVideoStream)
  })
  // removing peer video on disconnection
  call.on('close', () => {
    video.remove()
  })
  // Updating peers array
  peers[userId] = call;
}

// Function to add a video stream on the video grid display
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video);
}

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
    'message': messageInput.value,
    'username': username,
    'userID': userID
  }, ROOM_ID);
  messageInput.value = '';
}
