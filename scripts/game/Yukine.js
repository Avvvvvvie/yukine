class Yukine {
    static delimiters = {
        card: ":C:",
        pile: ":P:",
        action: ":A:",
        update: ":U:",
        player: "::",
        updateTarget: "----",
        path: "...."
    }
    static playerState = {
        NONE: "NONE",
        LOOSE: "LOOSE",
        WIN: "WIN",
        KEEP: "KEEP",
        SWAP: "SWAP",
        TOTALWIN: "TOTALWIN",
        TOTALLOOSE: "TOTALLOOSE",
        ELIGIBLE: "ELIGIBLE",
    }
    static lobbyState = {
        INGAME: "INGAME",
        WAITING: "WAITING"
    }
    static gameState = {
        ONGOING: "ONGOING",
        ENDGAME: "ENDGAME",
        OVER: "OVER"
    }
    static tries = ['Yukine', 'Yato', 'Hiyori'];
}