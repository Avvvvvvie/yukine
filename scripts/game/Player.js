class Player {
    locations = {
        hand: "Hand",
        played: "Played",
        tries: "Tries",
        eligible: "Eligible",
        lost: "Lost",
        tryCanceled: "TryCanceled",
        name: "Name"
    }
    constructor(steamID) {
        this.steamID = steamID.toString();
    }

    readUserData(key) {
        return steam.lobby.getData(this.steamID + ':' + key);
    }
}