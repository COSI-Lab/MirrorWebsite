$(document).ready(function() {
  $("#menu-button").click(function() {
    $("#navmobile").slideToggle(300);
    const menuButton = document.getElementById("menu-button");
    if (menuButton.className == "fa fa-bars") {
      menuButton.className = "fa fa-times";
    } else {
      menuButton.className = "fa fa-bars";
    }
  });
});
