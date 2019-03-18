$(document).ready(function () {

    // Initialize Firebase
// Make sure to match the configuration to the script version number in the HTML
// (Ex. 3.0 != 3.7.0)
var config = {
    apiKey: "AIzaSyAL0fkySN1QCB_loPseQeA1J0sBEcB3UKs",
    authDomain: "rps-multiplayer-fc719.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-fc719.firebaseio.com",
    projectId: "rps-multiplayer-fc719",
    storageBucket: "",
    messagingSenderId: "1014074924882"
  };
  
  firebase.initializeApp(config);
  
  // Create a variable to reference the database.
  var database = firebase.database();
  
  // -----------------------------
  
  // connectionsRef references a specific location in our database.
  // All of our connections will be stored in this directory.
  var connectionsRef = database.ref("/connections");
  
  // '.info/connected' is a special location provided by Firebase that is updated
  // every time the client's connection state changes.
  // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
  var connectedRef = database.ref(".info/connected");
  
  // When the client's connection state changes...
  connectedRef.on("value", function(snap) {
  
    // If they are connected..
    if (snap.val()) {
  
      // Add user to the connections list.
      var con = connectionsRef.push(true);
      // Remove user from the connection list when they disconnect.
      con.onDisconnect().remove();
    }
  });
  
  // When first loaded or when the connections list changes...
  connectionsRef.on("value", function(snap) {
  
    // Display the viewer count in the html.
    // The number of online users is the number of children in the connections list.
    if (snap.numChildren() === 1) {
        $("#player-1-connection").text("Connected!");
    } else if (snap.numChildren() === 2) {
        $("#player-1-connection").css("font-color","red").text("Connected!");
        $("#player-2-connection").text("Connected!");
    } else if (snap.numChildren() > 2) {
        $("#player-1-connection").text("Connected!");
        $("#player-2-connection").text("Connected!");
        $("#viewers").text(`There are ${snap.numChildren()} connected viewers.`);
    }
    
  });


    //Initialize variables
    var rockImgSrc = "assets/images/rock.png";
    var paperImgSrc = "assets/images/paper.png";
    var scissorsImgSrc = "assets/images/scissors.png";

    var player1Picked = false;
    var player2Picked = false;

    var player1Choice;
    var player2Choice;


    $(".player-1-choice").on("click", function(){
        player1Choice = $(this).val();
        console.log(player1Choice);
        if (!player1Picked){
            player1Picked = true;
            if (player1Choice === "paper") {
                $("#player-1-img").attr("src", paperImgSrc);
                $("#player-1-choice-text").append(`You picked: ${player1Choice}`);
            } else if (player1Choice === "rock") {
                $("#player-1-img").attr("src", rockImgSrc);
                $("#player-1-choice-text").append(`You picked: ${player1Choice}`);
            } else if (player1Choice === "scissors") {
                $("#player-1-img").attr("src", scissorsImgSrc);
                $("#player-1-choice-text").append(`You picked: ${player1Choice}`);
            }
        } else {
            alert("You already picked your choice.")
        }
        
    })

    $(".player-2-choice").on("click", function(){
        player2Choice = $(this).val();
        console.log(player2Choice);
        if (!player2Picked){
            player2Picked = true;
            if (player2Choice === "paper") {
                $("#player-2-img").attr("src", paperImgSrc);
                $("#player-2-choice-text").append(`You picked: ${player2Choice}`);
            } else if (player2Choice === "rock") {
                $("#player-2-img").attr("src", rockImgSrc);
                $("#player-2-choice-text").append(`You picked: ${player2Choice}`);
            } else if (player2Choice === "scissors") {
                $("#player-2-img").attr("src", scissorsImgSrc);
                $("#player-2-choice-text").append(`You picked: ${player2Choice}`);
            }
        } else {
            alert("You already picked your choice.")
        }
        
    })





});