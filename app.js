var http = require('http');
var fs = require('fs');
const express = require("express");
const cookies = require("cookie-parser");
var websocket = require("ws");
const bodyParser = require("body-parser");
var session = require("express-session");


var Game = require("./game");
var GameStats = require("./stats");
var messages = require("./messages");
var app = express();

//app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile("splash.html", {
        root: "./public"
    });
});

app.get("/play", (req, res) => {
    res.sendFile("game.html", {
        root: "./public"
    });
});

app.get("/queue", (req, res) => {
    res.sendFile("queue.html", {
        root: "./public"
    });
});

var server = http.createServer(app);
const wss = new websocket.Server({
    server
});
var websockets = {};

var currentGame = new Game(GameStats.gamesInitialized++);
var connectionID = 0;

wss.on("connection", function connection(ws) {

    let con = ws;
    con.id = connectionID++;
    let playerType = currentGame.addPlayer(con);
    websockets[con.id] = currentGame;
    let gameObj = websockets[con.id];

    console.log("Player %s placed in game %s as %s", con.id, currentGame.id, playerType);

    con.send((playerType == "A") ? messages.S_PLAYER_A : messages.S_PLAYER_B);

    if (currentGame.hasTwoConnectedPlayers()) {
        currentGame = new Game(GameStats.gamesInitialized++);
        sendTo(gameObj.playerA, "STATUS", "Second player has joined the game.");
    }

    con.on("message", function incoming(message) {
        let Msg = JSON.parse(message);
        
        if (Msg.type == "COLOUR") {
            if (Msg.playerType == "A") {
                gameObj.A_Colour = Msg.data;
                console.log("Player A Chose Code: " + gameObj.A_Colour);
                if (gameObj.playerB != null) { // check if player B is connected
                    sendTo(gameObj.playerB, "STATUS", "Other player has chosen his code.");
                
            }
            } else if (Msg.playerType == "B") {
                gameObj.B_Colour = Msg.data;
                console.log("Player B Chose Code: " + gameObj.B_Colour);
                sendTo(gameObj.playerA, "STATUS", "Other player has chosen his code.");
            }
            drawGame(); //start the game if both players have chosen codes
        }

        if (Msg.type == "GUESS") {
            if (Msg.playerType == "A") {
                if (Msg.data==gameObj.B_Colour) {
                    // A won
                    sendTo(gameObj.playerA, "GUESS", [4,0]);
                    console.log("Player A Won!");
                }
                else{
                    var red=getRedPegs(Msg.data,gameObj.B_Colour);
                    var white=getWhitePegs(Msg.data,gameObj.B_Colour);
                    var result=[red, white];
                    sendTo(gameObj.playerA, "GUESS", result);
                    sendTo(gameObj.playerB, "OPPONENT-GUESS", result);
                    console.log("Player A Guessed: " + Msg.data+" R("+red+")" +" W("+white+")");
                }

            } else if (Msg.playerType == "B") {
                if (Msg.data==gameObj.A_Colour) {
                    // B won
                    sendTo(gameObj.playerB, "GUESS", [4,0]);
                    console.log("Player B Won!");
                }
                else{
                    var red=getRedPegs(Msg.data,gameObj.A_Colour);
                    var white=getWhitePegs(Msg.data,gameObj.A_Colour);
                    var result=[red, white];
                    sendTo(gameObj.playerB, "GUESS", result);
                    sendTo(gameObj.playerA, "OPPONENT-GUESS", result);
                    console.log("Player B Guessed: " + Msg.data+" R("+red+")" +" W("+white+")");
                }
            }
        }
        
    });

    con.on("close", function (code) {
        console.log("Player "+con.id + " disconnected.");
        if (code == "1001") {
            gameObj.gameState = "COMPLETED";
            GameStats.gamesCompleted++;
        }
    });

    
    function drawGame() {
        // Check if both players have selected colours
        // aif yes, then start the game
        if (gameObj.A_Colour != null && gameObj.B_Colour != null) {
            sendTo(gameObj.playerA, "DRAW-GAME", null);
            sendTo(gameObj.playerB, "DRAW-GAME", null);
        }
    };
});

server.listen(3000);

function sendTo(to,type,data) {
    let msg = {
        type: type,
        data: data
    };
    to.send(JSON.stringify(msg));
};

function getRedPegs(guess, answer) {
    var correct = 0;
    var red = 0;
    var white = 0;
    var used = [false, false, false, false];

    // get red
    for (let i = 0; i < 4; i++) {
        if (guess.charAt(i) == answer.charAt(i)) {
            red++;
            used[i] = true;
        }
    }

    return red;
}

function getWhitePegs(guess, answer) {
    var correct = 0;
    var white = 0;


    var used = [false, false, false, false];

    // get white
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (used[j]) {
                continue;
            };

            if (guess.charAt(i) == answer.charAt(j)) {
                white++;
                used[j] = true;
                break;
            }
        }
    }

    return white;

};