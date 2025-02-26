class Yukine {
    locations = {
        currentPlayer: "CurrentPlayer",
        deck: "Deck",
        discardPile: "DiscardPile",
        round: "Round",
        saveableLoosers: "SaveableLoosers",
        winner: "Winner"
    }
    constructor() {
        this.steamplayers = steam.lobby.getMembers();
    }
}