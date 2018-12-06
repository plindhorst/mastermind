var game = function (gameID) {
    this.playerA = null;
    this.playerB = null;
    this.id = gameID;
	this.A_Colour = null;
    this.B_Colour = null;
    this.gameState = "0 JOINT";
};

game.prototype.addPlayer = function (p) {

    if (this.gameState != "0 JOINT" && this.gameState != "1 JOINT" && this.gameState != "COMPLETED") {
        return new Error("Invalid call to addPlayer, current state is %s", this.gameState);
    }

    if(this.gameState == "0 JOINT"){
        this.gameState="1 JOINT";
    }
    else if(this.gameState == "1 JOINT"){
        this.gameState="2 JOINT";
    }

    if (this.playerA == null) {
        this.playerA = p;
        return "A";
    }
    else {
        this.playerB = p;
        return "B";
    }
};




game.prototype.setColourA = function(c){
    this.A_Colour=c;
};
game.prototype.setColourB = function(c){
    this.B_Colour=c;
};

game.prototype.hasTwoConnectedPlayers = function () {
    return (this.gameState == "2 JOINT");
};

module.exports = game;