$(document).ready(function () {

    //Initialize some variables

    var player1connected = false;
    var player2connected = false;


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
    connectedRef.on("value", function (snap) {

        // If they are connected..
        if (snap.val()) {

            // Add user to the connections list.
            var con = connectionsRef.push(true);

            // Remove user from the connection list when they disconnect.
            con.onDisconnect().remove();

        }
    });

    var player1Name = "Player 1";
    var player2Name = "Player 2";


    // When first loaded or when the connections list changes...
    connectionsRef.on("value", function (snap) {

        // Display the viewer count in the html.
        // The number of online users is the number of children in the connections list.
        if (snap.numChildren() === 1) {

            player1Name = prompt("What is your name, Player 1?");

            database.ref("/playerNames").push({
                player1Name
            });

            $("#player-1-connection").text("Connected!").css("color", "green");
            $("#player-2-connection").text("Waiting for Player 2 to connect.").css("color", "red");
            player1connected = true;
            player2connected = false;

        } else if (snap.numChildren() === 2) {

            //This is displaying on Player 1's window once the second person connects...
            //Only want to show this on the second connection
            player2Name = prompt("What is your name, Player 2?");

            database.ref("/playerNames").push({
                player2Name
            });

            $("#player-1-connection").css("color", "green").text("Connected!");
            $("#player-2-connection").text("Connected!").css("color", "green");
            player1connected = true;
            player2connected = true;

        } else if (snap.numChildren() > 2) {
            $("#player-1-connection").text("Connected!").css("color", "green");
            $("#player-2-connection").text("Connected!").css("color", "green");
            player1connected = true;
            player2connected = true;
            $("#viewers").text(`There are ${snap.numChildren()} connected viewers in the audience.`);

        } else if (snap.numChildren() <= 0) {
            player1connected = false;
            player2connected = false;
            $("#player-1-connection").text("Waiting for Player 1 to connect.").css("color", "red");
            $("#player-2-connection").text("Waiting for Player 2 to connect.").css("color", "red");
        }
    });

    database.ref("/playerNames").on("child_added", function (snapshot) {

        player1Name = snapshot.val().player1Name;
        player2Name = snapshot.val().player2Name;

        console.log(`Player 1 Name: ${player1Name} and Player 2 Name: ${player2Name}`);

        $("#player-1-name").text(player1Name);
        $("#player-2-name").text(player2Name);

        database.ref("/playerNames").onDisconnect().remove();

    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    function sendChatMessage() {
        ref = firebase.database().ref("/chat");
        messageField = document.querySelector("#chat-message");

        ref.push().set({
            name: displayName,
            message: messageField.value
        });
    }

    ref = firebase.database().ref("/chat");

    ref.on("child_added", function (snapshot) {
        var message = snapshot.val();
        addChatMessage(message.name, message.message);
    });


    //Initialize variables
    var rockImgSrc = "assets/images/rock.png";
    var paperImgSrc = "assets/images/paper.png";
    var scissorsImgSrc = "assets/images/scissors.png";

    var player1Picked = false;
    var player2Picked = false;

    var player1Choice;
    var player2Choice;
    var player1ChoiceImgSrc;
    var player2ChoiceImgSrc;

    //Scoreboard variables
    var numTies = 0;
    var numWinsPlayer1 = 0;
    var numLossesPlayer1 = 0;
    var numWinsPlayer2 = 0;
    var numLossesPlayer2 = 0;

    //Function to reset 
    function reset() {
        $(".player-1-choice, .player-2-choice").show();
        player1Picked = false;
        player2Picked = false;
        $("#player-1-choose-text, #player-2-choose-text").text("Choose one:");
        $("#result").hide();
        $("#player-1-img, #player-2-img").hide();
    }

    //function to evaluate the choices & display the result:
    function playRPS(player1Choice, player2Choice) {
        if (player1Choice === player2Choice) {
            numTies++;
            $("#result").show().html('<h2>It\'s a tie!</h2>');
        } else if (player1Choice === "rock" && player2Choice === "scissors" ||
            player1Choice === "scissors" && player2Choice === "paper" ||
            player1Choice === "paper" && player2Choice === "rock") {
            numWinsPlayer1++;
            numLossesPlayer2++;
            $("#result").show().html('<h2>Player 1 wins!</h2>');
        } else if (player1Choice === "rock" && player2Choice === "paper" ||
            player1Choice === "scissors" && player2Choice === "rock" ||
            player1Choice === "paper" && player2Choice === "scissors") {
            numWinsPlayer2++;
            numLossesPlayer1++;
            $("#result").show().html('<h2>Player 2 wins!</h2>');
        }
    }

    //Function to show the images & update stats (only when both players have picked their choices)
    function showImages(player1ChoiceImgSrc, player2ChoiceImgSrc) {
        $("#player-1-img, #player-2-img").show();
        $("#player-1-img").attr("src", player1ChoiceImgSrc);
        $("#player-2-img").attr("src", player2ChoiceImgSrc);
        $("#player-1-stats").text(`Wins: ${numWinsPlayer1} | Losses: ${numLossesPlayer1} | Ties: ${numTies}`);
        $("#player-2-stats").text(`Wins: ${numWinsPlayer2} | Losses: ${numLossesPlayer2} | Ties: ${numTies}`);
    }

    //When Player 1 clicks a choice
    $(".player-1-choice").on("click", function () {
        //hide the choices
        $(".player-1-choice").hide();
        //get the value of that choice & the src of that img
        player1Choice = $(this).val();
        player1ChoiceImgSrc = $(this).attr("data-src");
        console.log(`Player 1 picked: ${player1Choice} with img ${player1ChoiceImgSrc}`);

        //set these values in the database
        database.ref("/playerChoices").push({
            player1Choice,
            player1ChoiceImgSrc
        });

        // if (player1connected && player2connected) {
        //     //if neither player has picked and player 1 clicked a choice
        //     if (!player1Picked && !player2Picked) {
        //         player1Picked = true;
        //         $("#player-1-choose-text").text("Waiting for Player 2 to choose...");
        //     } else if (player1Picked && !player2Picked) {
        //         $("#player-1-choose-text").text("Waiting for Player 2 to choose...");
        //         alert("You already picked your choice.");
        //     } else if (!player1Picked && player2Picked) {
        //         player1Picked = true;
        //         $("#player-1-choose-text, #player-2-choose-text").text("The results are in!");
        //         // playRPS(player1Choice, player2Choice);
        //         // showImages(player1ChoiceImgSrc, player2ChoiceImgSrc);
        //         setTimeout(reset, 1000 * 3);
        //     }
        // } else if (player1connected && !player2connected) {
        //     $("#player-1-choose-text").text("Waiting for Player 2 to connect...");
        // }
    });

    $(".player-2-choice").on("click", function () {
        $(".player-2-choice").hide();
        player2Choice = $(this).val();
        player2ChoiceImgSrc = $(this).attr("data-src");
        console.log(`Player 2 picked: ${player2Choice} with img ${player2ChoiceImgSrc}`);

        //set these values in the database
        database.ref("/playerChoices").push({
            player2Choice,
            player2ChoiceImgSrc
        });

        // if (player2connected && player1connected) {
        //     console.log(player1Picked, player2Picked);
        //     //if neither player has picked and player 1 clicked a choice
        //     if (!player2Picked && !player1Picked) {
        //         player2Picked = true;
        //         $("#player-2-choose-text").text("Waiting for Player 1 to choose...");
        //         console.log(player1Picked, player2Picked);
        //     } else if (player2Picked && !player1Picked) {
        //         $("#player-2-choose-text").text("Waiting for Player 1 to choose...");
        //         alert("You already picked your choice.");
        //         console.log(player1Picked, player2Picked);
        //     } else if (!player2Picked && player1Picked) {
        //         player2Picked = true;
        //         $("#player-2-choose-text, #player-1-choose-text").text("The results are in!");
        //         console.log(player1Picked, player2Picked);
        //         playRPS(player1Choice, player2Choice);
        //         showImages(player1ChoiceImgSrc, player2ChoiceImgSrc);
        //         setTimeout(reset, 1000 * 2);
        //     }
        // } else if (player1connected && !player2connected) {
        //     $("#player-2-choose-text").text("Waiting for Player 1 to connect...");
        // }
    });

    database.ref("/playerChoices").on("child_added", function (snapshot) {

        player1Choice = snapshot.val().player1Choice;
        player1ChoiceImgSrc = snapshot.val().player1ChoiceImgSrc;
        player2Choice = snapshot.val().player2Choice;
        player2ChoiceImgSrc = snapshot.val().player2ChoiceImgSrc;

        console.log(`Player 1 Choice: ${player1Choice} and Player 2 Choice: ${player2Choice}`);
        console.log(`Player1Choice in firebase: ${player1Choice}`);
        console.log(`Player2Choice in firebase: ${player2Choice}`);

        //logic of game depending on if a choice is picked 

        //NEED TO CONSOLE LOG THIS TO BE TRUE WHEN CLICKED ON A CHOICE- NOT WORKING!!!!
        console.log(`Player 1 Choice exists: ${snapshot.child("playerChoices/player1choice").exists()}`);
        console.log(`Player 2 Choice exists: ${snapshot.child("playerChoices/player2choice").exists()}`);
        
        // if (snapshot.child("player1Choice").exists() && snapshot.child("player2choice").exists()) {
        // playRPS(player1Choice, player2Choice);
        // showImages(player1ChoiceImgSrc, player2ChoiceImgSrc);
        // } 

        database.ref("/playerChoices").onDisconnect().remove();

    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    // //When player 2 picks their choice
    // $(".player-2-choice").on("click", function () {
    //     $(".player-2-choice").hide();
    //     player2Choice = $(this).val();
    //     console.log(`Player 2 picked: ${player2Choice}`);

    //     if (player2connected) {
    //         if (!player1Picked && !player2Picked) {
    //             player2Picked = true;
    //             if (player2Choice === "paper") {
    //                 // $("#player-2-img").attr("src", paperImgSrc);

    //                 //Save this choice in the database
    //                 // database.ref("/player2").set({
    //                 //     player2Choice: player2Choice,
    //                 //     player2ChoiceImgSrc: paperImgSrc
    //                 // });

    //                 // $("#player-2-choice-text").append(`You picked: ${player2Choice}`);
    //             } else if (player2Choice === "rock") {
    //                 // $("#player-2-img").attr("src", rockImgSrc);

    //                 //Save this choice in the database
    //                 // database.ref("/player2").set({
    //                 //     player2Choice: player2Choice,
    //                 //     player2ChoiceImgSrc: rockImgSrc
    //                 // });

    //                 // $("#player-2-choice-text").append(`You picked: ${player2Choice}`);
    //             } else if (player2Choice === "scissors") {
    //                 // $("#player-2-img").attr("src", scissorsImgSrc);

    //                 //Save this choice in the database
    //                 // database.ref("/player2").set({
    //                 //     player2Choice: player2Choice,
    //                 //     player2ChoiceImgSrc: scissorsImgSrc
    //                 // });

    //                 // $("#player-1-choice-text").append(`You picked: ${player2Choice}`);
    //             }
    //             $("#player-2-choose-text").text("Waiting for Player 1 to choose...");
    //         } else {
    //             alert("You already picked your choice.")
    //         }
    //     }
    // });

    // //When you click player 2's choice
    // $(".player-2-choice").on("click", function () {
    //     //hide the choices
    //     $(".player-2-choice").hide();
    //     //save the choice
    //     player2Choice = $(this).val();
    //     console.log(player2Choice);
    //     if (player2connected) {
    //         if (player1Picked && !player2Picked) {
    //             player2Picked = true;
    //             if (player2Choice === "paper") {
    //                 $("#player-2-img").attr("src", paperImgSrc);

    //                 database.ref("/player1").set({
    //                     player1Choice: player1Choice,
    //                     player1ChoiceImgSrc: paperImgSrc
    //                 });

    //                 $("#player-2-choice-text").append(`You picked: ${player2Choice}`);
    //             } else if (player2Choice === "rock") {
    //                 $("#player-2-img").attr("src", rockImgSrc);
    //                 $("#player-2-choice-text").append(`You picked: ${player2Choice}`);
    //             } else if (player2Choice === "scissors") {
    //                 $("#player-2-img").attr("src", scissorsImgSrc);
    //                 $("#player-2-choice-text").append(`You picked: ${player2Choice}`);
    //             }
    //         } else {
    //             alert("You already picked your choice.")
    //         }
    //     } else {
    //         alert("Waiting for another player to connect!");
    //     }

    // })





});