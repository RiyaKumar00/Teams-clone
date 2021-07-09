const teamGrid = document.getElementById('teamGrid');

document.addEventListener("DOMContentLoaded", function(){
  teams.forEach(function(team){
    teamGrid.innerHTML += "<a href='/" + userID + "/" + team.teamID + "' class='teams btn btn-primary' type='button' name='button'>" + team.teamName + "</a>";
    console.log(team.teamName);
  })
});

function goToDashboard(){
  var loc = '/dashboard/' + userID;
  location.href= loc;
}
