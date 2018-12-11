var game = function (gameID) {
    this.playerA = null;
    this.playerB = null;
    this.playerA_GUESSES = 10;
    this.playerB_GUESSES = 10;
    this.id = gameID;
	this.A_Colour = null;
    this.B_Colour = null;
    this.gameState = "0 JOINED";
};

game.prototype.addPlayer = function (p) {

    if (this.gameState != "0 JOINED" && this.gameState != "1 JOINED") {
        return new Error("Invalid call to addPlayer, current state is %s", this.gameState);
    }

    if(this.gameState == "0 JOINED"){
        this.gameState="1 JOINED";
        this.playerA = p;
        return "A";
    }
    else if(this.gameState == "1 JOINED"){
        this.gameState="2 JOINED";
        this.playerB = p;
        return "B";
    }
};

game.prototype.hasTwoConnectedPlayers = function () {
    return (this.gameState == "2 JOINED");
};

game.prototype.reset = function () {
	this.A_Colour = null;
    this.B_Colour = null;
    this.playerA = null;
    this.playerB = null;
    this.gameState = "0 JOINED";
};

module.exports = game;