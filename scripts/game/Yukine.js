class Yukine {
    locations = {
        currentPlayer: "CurrentPlayer",
        deck: "Deck",
        discardPile: "DiscardPile",
        round: "Round",
        saveableLoosers: "SaveableLoosers",
        winner: "Winner"
    }
    static delimiters = {
        card: ":C:",
        pile: ":P:",
        action: ":A:",
        update: ":U:",
        player: "::",
    }
    constructor() {
        this.steamplayers = steam.lobby.getMembers();
    }
}