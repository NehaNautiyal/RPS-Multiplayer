$(document).ready(function () {

    // Initialize some variables
    var userId;
    var profile;
    var name;
    var player1connected = false;
    var player2connected = false;

    var state = {
        player1: {
            id: "",
            name: "",
            choice: "",
            turn: false,
            wins: 0,
            losses: 0
        },
        player2: {
            id: "",
            name: "",
            choice: "",
            turn: false,
            wins: 0,
            losses: 0
        },
        ties: 0,
        playing: false
    }

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
    // Other directories on firebase are defined here as well
    var connectionsRef = database.ref("/connections");
    var usersRef = database.ref("/users");
    var stateRef = database.ref("/state");

    // '.info/connected' is a special location provided by Firebase that is updated
    // every time the client's connection state changes.
    var connectedRef = database.ref(".info/connected");

    // When the client's connection state changes...
    connectedRef.on("value", function (snap) {

        // If they are connected..
        if (snap.val()) {

            // Add user profile.
            profile = usersRef.push({
                id: "",
                name: "",
                choice: "",
                img: "",
                turn: false,
                wins: 0,
                losses: 0,
                ties: 0
            });

            //Get a unique key for each window that connects
            userId = profile.key;

            // Remove user from the connection list when they disconnect, along with all of their data
            connectionsRef.onDisconnect().remove();
            usersRef.onDisconnect().remove();
            // stateRef.onDisconnect().remove();

        }
    });

    // When first loaded, create a stateRef in firebase that will update as a second player joins, or if one player logs out of the window!
    database.ref().on("value", function (snap) {
        if (snap.numChildren() === 1) {
            stateRef.update({
                player1: {
                    id: "",
                    name: "",
                    choice: "",
                    img: "",
                    turn: false,
                    wins: 0,
                    losses: 0
                },
                player2: {
                    id: "",
                    name: "",
                    choice: "",
                    img: "",
                    turn: false,
                    wins: 0,
                    losses: 0
                },
                ties: 0,
                playing: false
            });

            // Need to update HTML that someone disconnected and all data has been reset. Need to enter name and play again
            $("#result").show().text("Someone got disconnected! Refresh your browser & re-enter your name to play.");
            $("#player-1-name").text("Player 1");
            $("#player-2-name").text("Player 2");
            $("#player-1-choose-text, #player-2-choose-text").text("Choose one:");
        }
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    // stateRef.on("value", function (s) {
    //     // If there is a value there, can anything be done
    //     if (s.val()) {
    //         // Evaluate which values are present
    //         // If there are no player values 

    //         // If there are player 1 values but no player 2 values

    //         // If there are player 2 values but no player 1 values

    //         // If there are both player 1 and player 2 values

    //     }

    // }, function (errorObject) {
    //     console.log("The read failed: " + errorObject.code);
    // });

    $("#player-join-game").on("click", function (e) {
        e.preventDefault();
        var name = $("#player-name-input").val().trim();
        // If the game has not started, there is no player 1 and the userId is not the same as player 2
        if (!state.playing && !state.player1.name && userId !== state.player2.id) {
            //Update this in the database as player 1
            usersRef.child(userId).update({
                id: "",
                name: name,
                choice: "",
                img: "",
                turn: false,
                wins: 0,
                losses: 0,
                ties: 0
            });
        } else if (!state.playing && !state.player2.name && userId !== state.player1.id) {
            usersRef.child(userId).update({
                id: "",
                name: name,
                choice: "",
                img: "",
                turn: false,
                wins: 0,
                losses: 0,
                ties: 0
            });
        }
        $("#player-name-input").val("");
    });

    // If anything changes in the usersRef in firebase, that needs to be updated in the stateRef, both in firebase and locally
    usersRef.on("child_changed", function (s) {
        if (!state.player1.name && !state.player2.name) {
            var player1 = s.val();
            stateRef.update({
                player1: {
                    id: s.key,
                    name: player1.name,
                    choice: "",
                    img: "",
                    turn: false,
                    wins: player1.wins,
                    losses: player1.losses
                },
                player2: {
                    id: "",
                    name: "",
                    choice: "",
                    img: "",
                    turn: false,
                    wins: 0,
                    losses: 0
                },
                ties: 0,
                playing: false
            });
            state.player1.name = player1.name;
            state.player1.id = s.key;
            state.player1.turn = true;
            state.player1.wins = player1.wins;
            state.player1.losses = player1.losses;
            console.log(`Player 1 name in local state ${state.player1.name}`);

        } else if (state.player1.name && !state.player2.name) {
            var player2 = s.val();
            console.log("player2" + player2);
            stateRef.update({
                player1: {
                    id: state.player1.id,
                    name: state.player1.name,
                    choice: "",
                    img: "",
                    turn: true,
                    wins: state.player1.wins,
                    losses: state.player1.losses
                },
                player2: {
                    id: s.key,
                    name: player2.name,
                    choice: "",
                    img: "",
                    turn: false,
                    wins: player2.wins,
                    losses: player2.losses
                },
                ties: 0,
                playing: true
            });
            state.player2.name = player2.name;
            state.player2.id = s.key;
            state.player1.turn = true;
            state.player2.wins = player2.wins;
            state.player2.losses = player2.losses;
            console.log(`Player 2 name in local state ${state.player2.name}`);
        }

        // else if (!state.player1.name && state.player2.name) {
        //     var player1 = s.val();
        //     stateRef.update({
        //         player1: {
        //             id: s.key,
        //             name: player1.name,
        //             choice: "",
        //             turn: true,
        //             wins: player1.wins,
        //             losses: player1.losses
        //         },

        //         ties: 0,
        //         playing: true
        //     });
        // }
    });



    stateRef.on("value", function (snap) {
        
        stateFb = snap.val();
        
        if (!stateFb.playing) {
            if (stateFb.player1.name && !stateFb.player2.name) {
                $("#player-1-connection").text("Connected!").css("color", "green");
                $("#player-2-connection").text("Waiting for another player...").css("color", "red");
                player1connected = true;
                player2connected = false;
                $("#player-1-name").text(stateFb.player1.name);
                state = stateFb;
                if (userId === stateFb.player1.id) {
                    $("#player-2-choose-text, .player-2-choice").hide();
                }
            } else if (stateFb.player2.name && !stateFb.player1.name) {
                $("#player-1-connection").text("Waiting for another player...").css("color", "red");
                $("#player-2-connection").text("Connected!").css("color", "green");
                player1connected = false;
                player2connected = true;
                $("#player-2-name").text(stateFb.player2.name);
                state = stateFb;
                if (userId === stateFb.player2.id) {
                    $("#player-1-choose-text, .player-1-choice").hide();
                }
            }
        } else if (stateFb.playing) {
            if (stateFb.player2.name && stateFb.player1.name) {
                $("#player-1-connection, #player-2-connection").text("Connected!").css("color", "green");
                player1connected = true;
                player2connected = true;
                $("#player-1-name").text(stateFb.player1.name);
                $("#player-2-name").text(stateFb.player2.name);
                state = stateFb;
                if (userId === stateFb.player1.id) {
                    $("#player-2-choose-text, .player-2-choice").hide();
                } else if (userId === stateFb.player2.id) {
                    if (!stateFb.player1.choice && !stateFb.player2.choice) {
                        $("#player-2-choose-text").text("Please wait until " + stateFb.player1.name + " chooses.");
                        $("#player-1-choose-text, .player-1-choice").hide();
                    }
                    else if (stateFb.player1.choice && !stateFb.player2.choice) {
                        $("#player-2-choose-text").text("Now it is your turn to choose.");
                    }
                }
            } if (stateFb.player1.choice && stateFb.player2.choice) {
                if (stateFb.player1.choice === stateFb.player2.choice) {
                    // Update the local state.tie variable
                    state.ties++;
                    // Update the database with the local variable
                    stateRef.update({
                        player1: {
                            id: state.player1.id,
                            name: state.player1.name,
                            choice: state.player1.choice,
                            img: state.player1.img,
                            turn: false,
                            wins: state.player1.wins,
                            losses: state.player1.losses
                        },
                        player2: {
                            id: state.player2.id,
                            name: state.player2.name,
                            choice: state.player2.choice,
                            img: state.player2.img,
                            turn: false,
                            wins: state.player2.wins,
                            losses: state.player2.losses
                        },
                        ties: state.ties,
                        playing: false
                    });

                    //Update the HTML
                    $("#result").show().html('<h2>It\'s a tie!</h2>');
                    $("#player-1-img, #player-2-img").show();
                    $("#player-1-img").attr("src", state.player1.img);
                    $("#player-2-img").attr("src", state.player2.img);
                    $("#player-1-stats").text(`Wins: ${state.player1.wins} | Losses: ${state.player1.losses} | Ties: ${state.ties}`);
                    $("#player-2-stats").text(`Wins: ${state.player2.wins} | Losses: ${state.player2.losses} | Ties: ${state.ties}`);

                    setTimeout(reset, 1000 * 5);

                } else if (stateFb.player1.choice === "rock" && stateFb.player2.choice === "scissors" ||
                    stateFb.player1.choice === "scissors" && stateFb.player2.choice === "paper" ||
                    stateFb.player1.choice === "paper" && stateFb.player2.choice === "rock") {
                    // Update local variable
                    state.player1.wins++;
                    state.player2.losses++;

                    // Update this in the database
                    stateRef.update({
                        player1: {
                            id: state.player1.id,
                            name: state.player1.name,
                            choice: state.player1.choice,
                            img: state.player1.img,
                            turn: false,
                            wins: state.player1.wins,
                            losses: state.player1.losses
                        },
                        player2: {
                            id: state.player2.id,
                            name: state.player2.name,
                            choice: state.player2.choice,
                            img: state.player2.img,
                            turn: false,
                            wins: state.player2.wins,
                            losses: state.player2.losses
                        },
                        ties: state.ties,
                        playing: false
                    });

                    // Update HTML
                    $("#result").show().html('<h2>Player 1 wins!</h2>');
                    $("#player-1-img, #player-2-img").show();
                    $("#player-1-img").attr("src", state.player1.img);
                    $("#player-2-img").attr("src", state.player2.img);
                    $("#player-1-stats").text(`Wins: ${state.player1.wins} | Losses: ${state.player1.losses} | Ties: ${state.ties}`);
                    $("#player-2-stats").text(`Wins: ${state.player2.wins} | Losses: ${state.player2.losses} | Ties: ${state.ties}`);

                    setTimeout(reset, 1000 * 5);

                } else if (stateFb.player1.choice === "rock" && stateFb.player2.choice === "paper" ||
                    stateFb.player1.choice === "scissors" && stateFb.player2.choice === "rock" ||
                    stateFb.player1.choice === "paper" && stateFb.player2.choice === "scissors") {

                    // Update local variable
                    state.player2.wins++;
                    state.player1.losses++;

                    // Update this in the database
                    stateRef.update({
                        player1: {
                            id: state.player1.id,
                            name: state.player1.name,
                            choice: state.player1.choice,
                            img: state.player1.img,
                            turn: false,
                            wins: state.player1.wins,
                            losses: state.player1.losses
                        },
                        player2: {
                            id: state.player2.id,
                            name: state.player2.name,
                            choice: state.player2.choice,
                            img: state.player2.img,
                            turn: false,
                            wins: state.player2.wins,
                            losses: state.player2.losses
                        },
                        ties: state.ties,
                        playing: false
                    });

                    // Update HTML
                    $("#result").show().html('<h2>Player 2 wins!</h2>');
                    $("#player-1-img, #player-2-img").show();
                    $("#player-1-img").attr("src", state.player1.img);
                    $("#player-2-img").attr("src", state.player2.img);
                    $("#player-1-stats").text(`Wins: ${state.player1.wins} | Losses: ${state.player1.losses} | Ties: ${state.ties}`);
                    $("#player-2-stats").text(`Wins: ${state.player2.wins} | Losses: ${state.player2.losses} | Ties: ${state.ties}`);

                    setTimeout(reset, 1000 * 5);
                }
            }
        }
    });



    // function renderHtml() {
    //     if (state.player1.name && !state.player2.name) {
    //         $("#player-1-connection").text("Connected!").css("color", "green");
    //         $("#player-2-connection").text("Waiting for another player...").css("color", "red");
    //         player1connected = true;
    //         player2connected = false;
    //         $("#player-1-name").text(state.player1.name);
    //         console.log(`Player 2 name in local state ${state.player2.name}`);
    //     } else if (state.player2.name && !state.player1.name) {
    //         $("#player-1-connection").text("Waiting for another player...").css("color", "red");
    //         $("#player-2-connection").text("Connected!").css("color", "green");
    //         player1connected = false;
    //         player2connected = true;
    //         $("#player-2-name").text(state.player2.name);
    //         console.log(`Player 2 name in local state ${state.player2.name}`);
    //     } else if (state.player2.name && state.player1.name) {
    //         $("#player-1-connection").css("color", "green").text("Connected!");
    //         $("#player-2-connection").text("Connected!").css("color", "green");
    //         player1connected = true;
    //         player2connected = true;
    //         $("#player-1-name").text(state.player1.name);
    //         $("#player-2-name").text(state.player2.name);
    //     }
    // }

    //check to see if player1 can leave the game and empty the name


    //get rid of numbers 
    //build object
    //only defined user can see it's own update
    //store somewhere in a global variable whatever name you typed in, that name will become key in object and can only see those nodes attached to that node
    //ignore that names could be the same
    //other side will be blank
    //bracket notation is key

    // //Don't want Player 1 to be 
    // $("#player-2-choose-text, .player-2-choice").hide();

    // } else if (snap.numChildren() === 2) {

    //     //Don't want Player 2 to be able to choose for Player 1
    //     //Player 1 needs to be able to choose first, but what if Player 2 connects? 
    //     // $("#player-1-choose-text, .player-1-choice").hide();

    // } else if (snap.numChildren() > 2) {
    //     $("#player-1-connection, #player-2-connection").text("Connected!").css("color", "green");
    //     player1connected = true;
    //     player2connected = true;
    //     $("#viewers").text(`There are ${snap.numChildren()} viewers in the audience.`);

    // } else if (snap.numChildren() <= 0) {
    //     player1connected = false;
    //     player2connected = false;
    //     $("#player-1-connection, #player-2-connection").text("Waiting for another player to connect.").css("color", "red");

    // }
    // });

    // database.ref("/playerNames").on("child_added", function (snapshot) {

    //     player1Name = snapshot.val().player1Name;
    //     player2Name = snapshot.val().player2Name;

    //     console.log(`Player 1 Name: ${player1Name} and Player 2 Name: ${player2Name}`);



    //     database.ref("/playerNames").onDisconnect().remove();

    // }, function (errorObject) {
    //     console.log("The read failed: " + errorObject.code);
    // });

    // function sendChatMessage() {
    //     ref = firebase.database().ref("/chat");
    //     messageField = document.querySelector("#chat-message");

    //     ref.push().set({
    //         name: displayName,
    //         message: messageField.value
    //     });
    // }

    // ref = firebase.database().ref("/chat");

    // ref.on("child_added", function (snapshot) {
    //     var message = snapshot.val();
    //     addChatMessage(message.name, message.message);
    // });


    //Initialize variables
    var rockImgSrc = "assets/images/rock.png";
    var paperImgSrc = "assets/images/paper.png";
    var scissorsImgSrc = "assets/images/scissors.png";

    // var player1Picked;
    // var player2Picked;

    // var player1Choice;
    // var player2Choice;
    // var player1ChoiceImgSrc;
    // var player2ChoiceImgSrc;

    // //Scoreboard variables
    // var numTies = 0;
    // var numWinsPlayer1 = 0;
    // var numLossesPlayer1 = 0;
    // var numWinsPlayer2 = 0;
    // var numLossesPlayer2 = 0;

    //Function to reset 
    function reset() {
        // Update local variable
        state = {
            player1: {
                id: state.player1.id,
                name: state.player1.name,
                choice: "",
                turn: true,
                wins: state.player1.wins,
                losses: state.player1.losses
            },
            player2: {
                id: state.player2.id,
                name: state.player2.name,
                choice: "",
                turn: false,
                wins: state.player2.wins,
                losses: state.player2.losses
            },
            ties: state.ties,
            playing: true
        }

        //Update this in the database 
        stateRef.update({
            player1: {
                id: state.player1.id,
                name: state.player1.name,
                choice: "",
                img: "",
                turn: true,
                wins: state.player1.wins,
                losses: state.player1.losses
            },
            player2: {
                id: state.player2.id,
                name: state.player2.name,
                choice: "",
                img: "",
                turn: false,
                wins: state.player2.wins,
                losses: state.player2.losses
            },
            ties: state.ties,
            playing: false
        });

        if (userId === state.player1.id) {
            $(".player-1-choice").show();
            $("#player-1-choose-text").show().text("Choose one:");
            $(".player-2-choice, #player-2-choose-text").hide();
        } else if (userId === state.player2.id) {
            $("#player-1-choose-text, .player-1-choice").hide();
            $("#player-2-choose-text").text("Please wait for " + state.player1.name + " to choose.");
            $(".player-2-choice").show();
        }
        $("#result").hide();
        $("#player-1-img, #player-2-img").hide();
    }

    //function to evaluate the choices & display the result:
    // function playRPS(player1Choice, player2Choice) {
    //     if (player1Choice === player2Choice) {


    //         numTies++;
    //         $("#result").show().html('<h2>It\'s a tie!</h2>');
    //     } else if (player1Choice === "rock" && player2Choice === "scissors" ||
    //         player1Choice === "scissors" && player2Choice === "paper" ||
    //         player1Choice === "paper" && player2Choice === "rock") {
    //         numWinsPlayer1++;
    //         numLossesPlayer2++;
    //         $("#result").show().html('<h2>Player 1 wins!</h2>');
    //     } else if (player1Choice === "rock" && player2Choice === "paper" ||
    //         player1Choice === "scissors" && player2Choice === "rock" ||
    //         player1Choice === "paper" && player2Choice === "scissors") {
    //         numWinsPlayer2++;
    //         numLossesPlayer1++;
    //         $("#result").show().html('<h2>Player 2 wins!</h2>');
    //     }
    // }

    // //Function to show the images & update stats (only when both players have picked their choices)
    // function showImages(player1ChoiceImgSrc, player2ChoiceImgSrc) {
    //     $("#player-1-img, #player-2-img").show();
    //     $("#player-1-img").attr("src", player1ChoiceImgSrc);
    //     $("#player-2-img").attr("src", player2ChoiceImgSrc);
    //     $("#player-1-stats").text(`Wins: ${state.player1.wins} | Losses: ${state.player1.losses} | Ties: ${state.ties}`);
    //     $("#player-2-stats").text(`Wins: ${state.player2.wins} | Losses: ${state.player2.losses} | Ties: ${state.ties}`);
    // }

    //When Player 1 clicks a choice
    $(".player-1-choice").on("click", function () {
        //Nothing can happen if it's not Player 1
        if (userId === state.player1.id) {
            //And it has to be Player 1's turn
            if (state.player1.turn) {

                //hide the choices
                $(".player-1-choice").hide();
                //get the value of that choice & the src of that img
                player1Choice = $(this).val();
                player1ChoiceImgSrc = $(this).attr("data-src");
                console.log(`Player 1 Choice: ${player1Choice} & imgSrc: ${player1ChoiceImgSrc}`);

                // Update the database
                stateRef.update({
                    player1: {
                        id: state.player1.id,
                        name: state.player1.name,
                        choice: player1Choice,
                        img: player1ChoiceImgSrc,
                        turn: false,
                        wins: state.player1.wins,
                        losses: state.player1.losses
                    },
                    player2: {
                        id: state.player2.id,
                        name: state.player2.name,
                        choice: "",
                        img: "",
                        turn: true,
                        wins: state.player2.wins,
                        losses: state.player2.losses
                    },
                    ties: 0,
                    playing: true
                });

                //Update the local state with these values
                state.player1.choice = player1Choice;
                state.player1.img = player1ChoiceImgSrc;
                state.player2.turn = true;
                $("#player-1-choose-text").text("Waiting for " + state.player2.name + " to choose");
                $("#player-2-choose-text").text("Now it's your turn.");

            } else {

                //Show that it is not Player 1's turn yet
                $("#player-1-choose-text").text("It is not your turn yet.");
            }
        } else {
            // User Id of the person clicking doesn't match the id of Player 1
            $("#player-1-choose-text").text("You are not Player 1.");
        }
    });

    $(".player-2-choice").on("click", function () {
        if (userId === state.player2.id) {
            if (state.player2.turn) {
                $(".player-2-choice").hide();
                player2Choice = $(this).val();
                player2ChoiceImgSrc = $(this).attr("data-src");

                // Update the database
                stateRef.update({
                    player1: {
                        id: state.player1.id,
                        name: state.player1.name,
                        choice: state.player1.choice,
                        img: state.player1.img,
                        turn: false,
                        wins: state.player1.wins,
                        losses: state.player1.losses
                    },
                    player2: {
                        id: state.player2.id,
                        name: state.player2.name,
                        choice: player2Choice,
                        img: player2ChoiceImgSrc,
                        turn: false,
                        wins: state.player2.wins,
                        losses: state.player2.losses
                    },
                    ties: 0,
                    playing: true
                });

                //Update the local state with these values 
                //THIS IS NOT WORKING, NOT UPDATING THE LOCAL VARIABLES
                state.player2.choice = player2Choice;
                state.player2.img = player2ChoiceImgSrc;
                state.player1.turn = false;
                state.player2.turn = false;

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
            } else {
                $("#player-2-choose-text").text("It is not your turn yet.");
            }
        } else {
            $("#player-2-choose-text").text("You are not player 2!");
        }
    });

    // database.ref("/playerChoices").on("child_added", function (snapshot) {

    //     player1Choice = snapshot.val().player1Choice;
    //     player1ChoiceImgSrc = snapshot.val().player1ChoiceImgSrc;
    //     player2Choice = snapshot.val().player2Choice;
    //     player2ChoiceImgSrc = snapshot.val().player2ChoiceImgSrc;

    //     console.log(`Player 1 Choice: ${player1Choice} and Player 2 Choice: ${player2Choice}`);
    //     console.log(`Player1Choice in firebase: ${player1Choice}`);
    //     console.log(`Player2Choice in firebase: ${player2Choice}`);


    //     console.log(`Player 1 Choice has child: ${snapshot.hasChild("player1Choice")}`);
    //     console.log(`Player 2 Choice haschild: ${snapshot.hasChild("player2Choice")}`);

    //     player1Picked = snapshot.hasChild("player1Choice"); //boolean
    //     player2Picked = snapshot.hasChild("player2Choice"); //boolean

    //     console.log(player1Picked);
    //     console.log(player2Picked);

    //     if (player2Picked && !player1Picked) {
    //         $("#player-2-choose-text").text("Waiting for Player 1 to choose...");
    //     } else if (player1Picked && !player2Picked) {
    //         $("#player-1-choose-text").text("Waiting for Player 2 to choose...");
    //     } else if (player1Picked && player2Picked) {
    //         playRPS(player1Choice, player2Choice);
    //         showImages(player1ChoiceImgSrc, player2ChoiceImgSrc);
    //         $("#player-2-choose-text, #player-1-choose-text").text("The results are in!");
    //         setTimeout(reset, 1000 * 3);
    //     }

    //     database.ref("/playerChoices").onDisconnect().remove();

    // }, function (errorObject) {
    //     console.log("The read failed: " + errorObject.code);
    // });

    // // //When player 2 picks their choice
    // // $(".player-2-choice").on("click", function () {
    // //     $(".player-2-choice").hide();
    // //     player2Choice = $(this).val();
    // //     console.log(`Player 2 picked: ${player2Choice}`);

    // //     if (player2connected) {
    // //         if (!player1Picked && !player2Picked) {
    // //             player2Picked = true;
    // //             if (player2Choice === "paper") {
    // //                 // $("#player-2-img").attr("src", paperImgSrc);

    // //                 //Save this choice in the database
    // //                 // database.ref("/player2").set({
    // //                 //     player2Choice: player2Choice,
    // //                 //     player2ChoiceImgSrc: paperImgSrc
    // //                 // });

    // //                 // $("#player-2-choice-text").append(`You picked: ${player2Choice}`);
    // //             } else if (player2Choice === "rock") {
    // //                 // $("#player-2-img").attr("src", rockImgSrc);

    // //                 //Save this choice in the database
    // //                 // database.ref("/player2").set({
    // //                 //     player2Choice: player2Choice,
    // //                 //     player2ChoiceImgSrc: rockImgSrc
    // //                 // });

    // //                 // $("#player-2-choice-text").append(`You picked: ${player2Choice}`);
    // //             } else if (player2Choice === "scissors") {
    // //                 // $("#player-2-img").attr("src", scissorsImgSrc);

    // //                 //Save this choice in the database
    // //                 // database.ref("/player2").set({
    // //                 //     player2Choice: player2Choice,
    // //                 //     player2ChoiceImgSrc: scissorsImgSrc
    // //                 // });

    // //                 // $("#player-1-choice-text").append(`You picked: ${player2Choice}`);
    // //             }
    // //             $("#player-2-choose-text").text("Waiting for Player 1 to choose...");
    // //         } else {
    // //             alert("You already picked your choice.")
    // //         }
    // //     }
    // // });

    // // //When you click player 2's choice
    // // $(".player-2-choice").on("click", function () {
    // //     //hide the choices
    // //     $(".player-2-choice").hide();
    // //     //save the choice
    // //     player2Choice = $(this).val();
    // //     console.log(player2Choice);
    // //     if (player2connected) {
    // //         if (player1Picked && !player2Picked) {
    // //             player2Picked = true;
    // //             if (player2Choice === "paper") {
    // //                 $("#player-2-img").attr("src", paperImgSrc);

    // //                 database.ref("/player1").set({
    // //                     player1Choice: player1Choice,
    // //                     player1ChoiceImgSrc: paperImgSrc
    // //                 });

    // //                 $("#player-2-choice-text").append(`You picked: ${player2Choice}`);
    // //             } else if (player2Choice === "rock") {
    // //                 $("#player-2-img").attr("src", rockImgSrc);
    // //                 $("#player-2-choice-text").append(`You picked: ${player2Choice}`);
    // //             } else if (player2Choice === "scissors") {
    // //                 $("#player-2-img").attr("src", scissorsImgSrc);
    // //                 $("#player-2-choice-text").append(`You picked: ${player2Choice}`);
    // //             }
    // //         } else {
    // //             alert("You already picked your choice.")
    // //         }
    // //     } else {
    // //         alert("Waiting for another player to connect!");
    // //     }

    // // })





});