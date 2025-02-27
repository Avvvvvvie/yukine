class Steam  {
    static client = init(480);
    constructor(props) {
        this.steamCallback = new SteamCallbackObservable();
        this.playerName = Steam.client.localplayer.getName();
        this.playerAccountId = Steam.client.localplayer.getSteamId().accountId.toString();
        this.isHost = false;
    }

    createLobby(type, maxMembers) {
        let promise = Steam.client.matchmaking.createLobby(type, maxMembers);
        promise.then((lobby) => {
            steam.lobby = lobby;
            this.players = this.lobby.getMembers();
            this.steamCallback.subscribe(SteamCallback.GameLobbyJoinRequested, () => {
               console.log('GameLobbyJoinRequested');
            });
            this.addChatMessage(steam.playerName + ' created the lobby');
            this.addPlayerInfo();
            this.setHost();
            this.settings = new SettingsClient();
            this.settingsServer = new SettingsServer();
            console.log('ishost1', this.isHost);
        });
        return promise;
    }

    joinLobby(lobbyID) {
        let promise = Steam.client.matchmaking.joinLobby(lobbyID)
        promise.then((lobby) => {
            this.players = this.lobby.getMembers();
            this.addChatMessage(steam.playerName + ' joined the lobby');
            this.addPlayerInfo();
            this.settings = new SettingsClient();
            steam.lobby = lobby;
        });
        return promise;
    }
    addChatMessage(message) {
        this.lobby.setData('chat', this.lobby.getData('chat') + ',' + message);
    }
    addPlayerInfo() {
        this.lobby.setData(this.playerAccountId, Steam.client.localplayer.getName());
    }
    setHost() {
        this.isHost = true;
        this.lobby.setData('host', this.playerAccountId);
    }
    leaveLobby() {
        if(this.lobby) {
            this.lobby.leave();
            this.lobby = null;
            this.isHost = false;
        }
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

    startGame() {
        this.players = this.lobby.getMembers();

        if(steam.isHost) {
            steam.yukineServer = new YukineServer();
        }
        steam.yukineClient = new YukineClient();
    }
}