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

    }

    con.on("message", function incoming(message) {


        let Msg = JSON.parse(message);
        if (Msg.type == "COLOUR-A") {
            gameObj.A_Colour = Msg.colour;
            sendColours();
        } else if (Msg.type == "COLOUR-B") {
            gameObj.B_Colour = Msg.colour;
            sendColours();
        }
        console.log("A: " + gameObj.A_Colour);
        console.log("B: " + gameObj.B_Colour);
    });

    con.on("close", function (code) {
        console.log(con.id + " disconnected ...");
        if (code == "1001") {
            gameObj.gameState = "COMPLETED";
            GameStats.gamesCompleted++;
        }
    });

    function sendColours() {
        // Check if both players have selected colours
        // and send to opponent
        if (gameObj.A_Colour != null && gameObj.B_Colour != null) {
            let opponentColour = {
                type: "OPPONENT-COLOUR",
                colour: gameObj.B_Colour
            };
            gameObj.playerA.send(JSON.stringify(opponentColour));

            opponentColour = {
                type: "OPPONENT-COLOUR",
                colour: gameObj.A_Colour
            };
            gameObj.playerB.send(JSON.stringify(opponentColour));
        }
    };
});

server.listen(3000);