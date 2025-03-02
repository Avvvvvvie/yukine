class Yukine {
    static delimiters = {
        card: ":C:",
        pile: ":P:",
        action: ":A:",
        update: ":U:",
        player: "::",
        updateTarget: "----",
        path: "aaaa"
    }
    static playerState = {
        NONE: "NONE",
        LOOSE: "LOOSE",
        WIN: "WIN",
        KEEP: "KEEP",
        SWAP: "SWAP",
        TOTALWIN: "TOTALWIN"
    }
    static gameState = {
        LOBBY: "LOBBY",
        ONGOING: "ONGOING",
        ENDGAME: "ENDGAME",
        OVER: "OVER"
    }
}