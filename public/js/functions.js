// JAVASCRIPT FUNCTION FOR DASHBOARD
// Getting the required elemenets by the IDs
const teamGrid = document.getElementById('teamGrid');

// On loading dashboard, Add all the existing teams, that the user is a member of, to the teams display.
document.addEventListener("DOMContentLoaded", function() {
  teams.forEach(function(team) {
    teamGrid.innerHTML += "<a href='/" + userID + "/" + team.teamID + "' class='teams btn btn-primary' type='button' name='button'>" + team.teamName + "</a>";
    console.log(team.teamName);
  })
});

// Navbar dashboard button function
function goToDashboard() {
  var loc = '/dashboard/' + userID;
  location.href = loc;
}
