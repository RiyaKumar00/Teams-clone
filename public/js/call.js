var socket = io.connect("http://localhost:3000/");
var userVideo = document.getElementById("user-video");
var peerVideo = document.getElementById("peer-video");
// var roomInput = document.getElementById("roomName");
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
  navigator.getUserMedia({
    audio: true,
    video: {width: 400, height: 400},
  },
  function(stream){
    userStream = stream;
    userVideo.srcObject = stream;
    userVideo.onloadedmetadata = function(e){
      userVideo.play();
    };
  },
  function(){
    console.log("Couldn't access user media");
  });
});

socket.on('joined', function(){
  navigator.getUserMedia({
    audio: true,
    video: {width: 400, height: 400},
  },
  function(stream){
    userStream = stream;
    userVideo.srcObject = stream;
    userVideo.onloadedmetadata = function(e){
      userVideo.play();
    };
    socket.emit('ready', roomID);
  },
  function(){
    console.log("Couldn't access user media");
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
}