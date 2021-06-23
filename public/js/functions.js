var userVideo = document.getElementById("user-video");
var peerVideo = document.getElementById("peer-video");
var cameraButton = document.getElementById("cameraButton");
var micButton = document.getElementById("micButton");

function goBack() {
  window.history.back();
}

function displayPeerVideo(){
  peerVideo.classList.remove("peerVideo");
  userVideo.classList.remove("userVideo");
}

function removePeerVideo(){
  peerVideo.classList.add("peerVideo");
  userVideo.classList.add("userVideo");
}

function playPause(){
  userStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
  if(userVideo.paused){
    userVideo.play();
    cameraButton.style.backgroundImage = 'url("/images/videocam.png")';
    userVideo.style.removeProperty("display");
    peerVideo.style.margin = "0 0 0 4.5vw";
  }
  else{
    userVideo.pause();
    cameraButton.style.backgroundImage = 'url("/images/videocam_off.png")';
    userVideo.style.display = "none";
    peerVideo.style.margin = "0 0 0 25vw";
  }
}

function muteUnmute(){
  userStream.getAudioTracks().forEach(function(track){
    if(track.enabled){
      track.enabled = false;
      micButton.style.backgroundImage = 'url("/images/mic_off.png")';
    }
    else{
      track.enabled = true;
      micButton.style.backgroundImage = 'url("/images/mic_none.png")';
    }
  });
}

function shareLink(){
  alert("Share the link to add participants:\r\n" + window.location.href);
}
