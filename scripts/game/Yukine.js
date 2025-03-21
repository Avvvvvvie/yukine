class Yukine {
    static client = (() => {
        let i;
        try {
            i = init(480);
        } catch(error) {
            pages.onLoad(() => {
                pages.showError("Could not connect to Steam: " + error.message, () => {
                    location.reload();
                });
            });
        }
        return i;
    })();
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
    constructor() {
        this.steamCallback = new SteamCallbackObservable();
        this.playerName = Yukine.client.localplayer.getName();
        this.playerAccountId = Yukine.client.localplayer.getSteamId().accountId.toString();
        this.isHost = false;
    }

    initLobby(lobby, isHost) {
        if(isHost) {
            yukine.lobbyServer = new LobbyServer(lobby);
        }
        yukine.lobbyClient = new LobbyClient(lobby);
        yukine.lobbyClient.state.subscribe((oldValue, newValue) => {
            if(newValue === Yukine.lobbyState.INGAME) {
                yukine.lobbyClient.startGame();
                pages.views.game.init(yukine.lobbyClient.yukineClient);
            }
        });
        if(isHost) {
            yukine.lobbyServer.addChatMessage(yukine.playerName + ' created the lobby');
            yukine.isHost = true;
            yukine.lobbyServer.setKey('host', this.playerAccountId);
        }
        yukine.lobbyClient.joinLobby();
        pages.views.lobby.init(yukine.lobbyClient);
    }

    createLobby(type, maxMembers) {
        let promise = Yukine.client.matchmaking.createLobby(type, maxMembers);
        promise.then((lobby) => {
            yukine.initLobby(lobby, true);
        });
        return promise;
    }

    joinLobby(lobbyID) {
        let promise = Yukine.client.matchmaking.joinLobby(lobbyID)
        promise.then((lobby) => {
            yukine.initLobby(lobby, false);
        });
        return promise;
    }
    leaveLobby() {
        if(yukine.lobbyClient) {
            yukine.lobbyClient.lobby.leave();
            yukine.lobbyClient = null;
            yukine.lobbyServer = null;
            yukine.isHost = false;
            yukine.steamCallback.unsubscribeAll();
        }
    }
    startGame() {
        yukine.lobbyServer.startGame();
    }
    openGamePage() {
        Yukine.client.overlay.activateToWebPage('https://www.example.com/');
    }

    static lobbyIDToCode(lobbyID) {
        let code = '';
        while(lobbyID > 0) {
            code = (lobbyID % BigInt(36)).toString(36) + code;
            lobbyID = lobbyID / BigInt(36);
        }
        return code.toUpperCase();
    }

    static CodeToLobbyID(code) {
        code = code.toLowerCase();
        return [...code.toString()]
            .reduce((r, v) => r * BigInt(36) + BigInt(parseInt(v, 36)), 0n);
    }
}