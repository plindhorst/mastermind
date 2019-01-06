const http = require('http');
const express = require("express");
const websocket = require("ws");

var port=3000;
var Game = require("./game");
var GameStats = require("./stats");
var app = express();

app.set("view engine", "ejs");

// Routes
app.use(express.static(__dirname + "/public"));


app.get("/", (req, res) => {
    res.render("splash.ejs", {inGamePlayers: GameStats.inGamePlayers, gamesInitialized: GameStats.gamesInitialized, queuePlayers: GameStats.queuePlayers});
});

app.get("/play", (req, res) => {
    res.sendFile("game.html", {
        root: "./public"
    });
});

app.get("/offline", (req, res) => {
    res.sendFile("offline.html", {
        root: "./public"
    });
});

app.get("/rules", (req, res) => {
    res.sendFile("rules.html", {
        root: "./public"
    });
});



var server = http.createServer(app);
const wss = new websocket.Server({server});
var websockets = {};

//websockets[0] = new Game(GameStats.gamesInitialized);
var connectionID = 1;


wss.on("connection", function connection(ws) {
    let gameObj;
    let playerType;
    let con = ws;
    con.id = connectionID++; // ID of player
    con.state = "queue";
    GameStats.queuePlayers++; // Increment queue stat

    for(let i in websockets){ // Join game if possible
        if (websockets[i].gameState=="0 JOINED" || websockets[i].gameState=="1 JOINED") {
            playerType = websockets[i].addPlayer(con);
            gameObj = websockets[i];
            console.log("Player %s placed in game %s as %s", con.id, websockets[i].id, playerType);
            break;
        }
    }
    if (typeof gameObj === 'undefined') { // no joinable game found: create a new game
        GameStats.gamesInitialized++;
        gameObj=new Game(GameStats.gamesInitialized);
        websockets[GameStats.gamesInitialized] = gameObj;
        playerType = websockets[GameStats.gamesInitialized].addPlayer(con);
        console.log("Game %s created.", GameStats.gamesInitialized);
        console.log("Player %s placed in game %s as %s", con.id, websockets[GameStats.gamesInitialized].id, playerType);
    }
    
    // Send to player what type he is
    con.send((playerType == "A") ? sendTo(gameObj.playerA,"PLAYER-TYPE", "A") : sendTo(gameObj.playerB,"PLAYER-TYPE", "B"));

    // If a second player joins the game, notify first player
    if (gameObj.hasTwoConnectedPlayers()) {
        sendTo(gameObj.playerA, "STATUS", "Second player has joined the game.");
    }


    // Messages from Client to the Server
    con.on("message", function incoming(message) {
        let Msg = JSON.parse(message); // Parse message string to get JS objects
        
        if (Msg.type == "COLOUR") { // Message is a selected colour
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
            con.state = "game";
            GameStats.queuePlayers--; // Decrement queue stat
            GameStats.inGamePlayers++; // Increment ingame stat
            drawGame(); //start the game if both players have chosen codes
        }

        if (Msg.type == "GUESS") { // Message is a guess
            if (Msg.playerType == "A") {
                if (Msg.data==gameObj.B_Colour) {   // A won
                    sendTo(gameObj.playerA, "GUESS", [4,0]);
                    sendTo(gameObj.playerB, "OPPONENT-GUESS", [4,0]);
                    sendTo(gameObj.playerA, "WON-GAME");
                    sendTo(gameObj.playerB, "LOST-GAME");
                    console.log("Player A won in Game"+gameObj.id);
                }
                
                else{
                    var result=getPegs(Msg.data,gameObj.B_Colour);
                    sendTo(gameObj.playerA, "GUESS", result);
                    sendTo(gameObj.playerB, "OPPONENT-GUESS", result);
                    sendTo(gameObj.playerB, "OPPONENT-GUESS-CODE", Msg.data);
                    gameObj.playerA_GUESSES--; // Decrement guesses
                    console.log("Player A Guessed: " + Msg.data+" R("+result[0]+")" +" W("+result[1]+")");
                    if(gameObj.playerA_GUESSES==0 && result[0]!=4){ // Check if player has 0 guesses left = lost
                        sendTo(gameObj.playerA, "LOST-GAME");
                        sendTo(gameObj.playerB, "WON-GAME");
                        console.log("Player B won in Game"+gameObj.id);
                    }
                }

            } else if (Msg.playerType == "B") {
                if (Msg.data==gameObj.A_Colour) {   // B won
                    sendTo(gameObj.playerB, "GUESS", [4,0]);
                    sendTo(gameObj.playerA, "OPPONENT-GUESS", [4,0]);
                    sendTo(gameObj.playerB, "WON-GAME");
                    sendTo(gameObj.playerA, "LOST-GAME");
                    console.log("Player B won in Game"+gameObj.id);
                }
                else{
                    var result=getPegs(Msg.data,gameObj.A_Colour);
                    sendTo(gameObj.playerB, "GUESS", result);
                    sendTo(gameObj.playerA, "OPPONENT-GUESS", result);
                    sendTo(gameObj.playerA, "OPPONENT-GUESS-CODE", Msg.data);
                    console.log("Player B Guessed: " + Msg.data+" R("+result[0]+")" +" W("+result[1]+")");
                    if(gameObj.playerB_GUESSES==0 && result[0]!=4){ // Check if player has 0 guesses left = lost
                        sendTo(gameObj.playerB, "LOST-GAME");
                        sendTo(gameObj.playerA, "WON-GAME");
                        console.log("Player A won in Game"+gameObj.id);
                    }
                }
            }
        }
        if (Msg.type == "NEW-GAME") {
            con.close();
        }
    });

    con.on("close", function () { // When a player disconnects
        console.log("Player "+ con.id + " disconnected.");
        try {
            sendTo(gameObj.playerB, "QUIT-GAME", null);
        } catch (error) {}
        try {
            sendTo(gameObj.playerA, "QUIT-GAME", null);
        } catch (error) {}
        if (gameObj.gameState == "1 JOINED")
            gameObj.gameState = "0 JOINED";
        if (gameObj.gameState == "0 JOINED") // If all players have left
            gameObj.reset(); // reset game for reuse
        if (con.state == "game" && GameStats.inGamePlayers != 0)
            GameStats.inGamePlayers--; // Decrement ingame stat
        if (con.state == "queue" && GameStats.queuePlayers != 0)
            GameStats.queuePlayers--; // Decrement queue stat
        console.log("Game " + gameObj.id + " has ended.");
    });

    
    function drawGame() {
        // Check if both players have selected colours
        // if yes, then start the game
        if (gameObj.A_Colour != null && gameObj.B_Colour != null) {
            sendTo(gameObj.playerA, "DRAW-GAME", null);
            sendTo(gameObj.playerB, "DRAW-GAME", null);
        }
    };
});


// Send to the Client
function sendTo(to,type,data) {
    let msg = {
        type: type,
        data: data
    };
    to.send(JSON.stringify(msg));
};

// Calculate red and white pegs
function getPegs(guess, answer) {
    var result = [0, 0];
    var white = 0;
    var red = 0;
    for (let i = 0; i < 4; i++) {
        if (guess.charAt(i) == answer.charAt(i)) {
            red++;
        }
        for (let j = 0; j < 4; j++) {
            if (guess.charAt(i) == answer.charAt(j)) {
                white++;
                break;
            }
        }
    }
    result[0] = red;
    result[1] = Math.abs(red - white);
    return result;
};

server.listen(port); // Listen at port 3000