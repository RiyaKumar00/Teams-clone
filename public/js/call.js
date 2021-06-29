var socket = io.connect();
var userVideo = document.getElementById("user-video");
var peerVideo = document.getElementById("peer-video");
var cameraButton = document.getElementById("cameraButton");
var micButton = document.getElementById("micButton");
var message = document.getElementById("messageInput");
var creator = false;
var rtcPeerConnection;
var userStream;

var iceServers = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
}

document.addEventListener('DOMContentLoaded', function(){
  socket.emit("join", roomID);
});

socket.on('created', function(){
  creator = true;
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  }).then(function(stream) {
    userStream = stream;
    userVideo.srcObject = stream;
    preControls();
    userVideo.onloadedmetadata = function(e){
      userVideo.play();
    };
  }).catch(function(err) {
    console.log(err);
  });
});

socket.on('joined', function(){
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  }).then(function(stream) {
    userStream = stream;
    userVideo.srcObject = stream;
    preControls();
    userVideo.onloadedmetadata = function(e){
      userVideo.play();
    };
    socket.emit('ready', roomID);
  }).catch(function(err) {
    console.log(err);
  });
});

socket.on('full', function(){
  alert("Room is full. Can't join.");
});

socket.on('ready', function(){
  if(creator){
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = OnIceCandidatefunction;
    rtcPeerConnection.ontrack = OnTrackfunction;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream); //Video Info
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream); //Audio Info
    rtcPeerConnection.createOffer(
      function(offer){
        rtcPeerConnection.setLocalDescription(offer);
        socket.emit('offer', offer, roomID);
      },
      function(error){
        console.log(error);
      });
  }
});

socket.on('candidate', function(candidate){
  var icecandidate = new RTCIceCandidate(
    {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
    });
  rtcPeerConnection.addIceCandidate(icecandidate);
});

socket.on('offer', function(offer){
  if(!creator){
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = OnIceCandidatefunction;
    rtcPeerConnection.ontrack = OnTrackfunction;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream); //Video Info
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream); //Audio Info
    rtcPeerConnection.setRemoteDescription(offer);
    rtcPeerConnection.createAnswer(
      function(answer){
        rtcPeerConnection.setLocalDescription(answer);
        socket.emit('answer', answer, roomID);
      },
      function(error){
        console.log(error);
      });
  }
});
socket.on('answer', function(answer){
  rtcPeerConnection.setRemoteDescription(answer);
});

socket.on('broadcastMessage', function(data){
  console.log(data.message);
  addChat(data);
});

socket.on('peerDisconnected', function(){
  removePeerVideo();
})

function OnIceCandidatefunction(event){
  if(event.candidate){
    socket.emit('candidate', event.candidate, roomID);
  }
}

function OnTrackfunction(event){
  peerVideo.srcObject = event.streams[0];
  peerVideo.onloadedmetadata = function(e){
    peerVideo.play();
  };
  displayPeerVideo();
}

function emitMessage(){
  socket.emit('sendingMessage', {
    'message': messageInput.value,
    'username': username
  }, roomID);
  message.value='';
}
