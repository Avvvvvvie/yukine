class Steam  {
    static client = init(480);
    constructor() {
        this.steamCallback = new SteamCallbackObservable();
        this.playerName = Steam.client.localplayer.getName();
        this.playerAccountId = Steam.client.localplayer.getSteamId().accountId.toString();
        this.isHost = false;
    }

    initLobby(lobby, isHost) {
        if(isHost) {
            steam.lobbyServer = new LobbyServer(lobby);
        }
        steam.lobbyClient = new LobbyClient(lobby);
        steam.lobbyClient.state.subscribe((oldValue, newValue) => {
            if(newValue === Yukine.lobbyState.INGAME) {
                steam.lobbyClient.startGame();
                gameView.showGame(steam.lobbyClient.yukineClient);
            }
        });
        if(isHost) {
            steam.lobbyServer.addChatMessage(steam.playerName + ' created the lobby');
            steam.isHost = true;
            steam.lobbyServer.setKey('host', this.playerAccountId);
        }
        steam.lobbyClient.joinLobby();
        lobbyView.showLobby(steam.lobbyClient);
    }

    createLobby(type, maxMembers) {
        let promise = Steam.client.matchmaking.createLobby(type, maxMembers);
        promise.then((lobby) => {
            steam.initLobby(lobby, true);
        }).catch((error) => {
            pages.showError(error.message);
        });
        return promise;
    }

    joinLobby(lobbyID) {
        let promise = Steam.client.matchmaking.joinLobby(lobbyID)
        promise.then((lobby) => {
            steam.initLobby(lobby, false);
        }).catch((error) => {
            pages.showError(error.message);
        });
        return promise;
    }
    leaveLobby() {
        if(steam.lobbyClient) {
            steam.lobbyClient.lobby.leave();
            steam.lobbyClient = null;
            steam.lobbyServer = null;
            steam.isHost = false;
            steam.steamCallback.unsubscribeAll();
        }
    }
    startGame() {
        steam.lobbyServer.startGame();
    }
    openGamePage() {
        Steam.client.overlay.activateToWebPage('https://www.example.com/');
    }

    lobbyIDToCode(lobbyID) {
        let code = '';
        while(lobbyID > 0) {
            code = (lobbyID % BigInt(36)).toString(36) + code;
            lobbyID = lobbyID / BigInt(36);
        }
        return code.toUpperCase();
    }

    CodeToLobbyID(code) {
        code = code.toLowerCase();
        return [...code.toString()]
            .reduce((r, v) => r * BigInt(36) + BigInt(parseInt(v, 36)), 0n);
    }
}