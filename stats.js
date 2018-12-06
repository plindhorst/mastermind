var gamestats = {
    since : Date.now(),     /* since we keep it simple and in-memory, keep track of when this object was created */
    gamesInitialized : 0,   /* number of games initialized */
    inGamePlayers: 0,
    queuePlayers: 0
};

module.exports = gamestats;