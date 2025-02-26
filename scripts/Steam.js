class Steam  {
    client = init(480);
    lobby = null;
    playerName = this.client.localplayer.getName();
    playerSteamID = this.client.localplayer.getSteamId();
    isHost = false;

    joinLobby(lobbyID) {
        let promise = this.client.matchmaking.joinLobby(lobbyID)
        promise.then((lobby) => {
            this.addChatMessage(steam.playerName + ' joined the lobby');
            this.addPlayerInfo();
            steam.lobby = lobby;
        });
        return promise;
    }
    addChatMessage(message) {
        this.lobby.setData('chat', this.lobby.getData('chat') + ',' + message);
    }
    addPlayerInfo() {
        this.lobby.setData(this.client.localplayer.getSteamId().accountId.toString(), this.client.localplayer.getName());
    }
    setHost() {
        this.isHost = true;
        this.lobby.setData('host', this.client.localplayer.getSteamId().accountId.toString());
    }
    createLobby(type, maxMembers) {
        let promise = this.client.matchmaking.createLobby(type, maxMembers);
        promise.then((lobby) => {
            steam.lobby = lobby;
            this.addChatMessage(steam.playerName + ' created the lobby');
            this.addPlayerInfo();
            this.setHost();
            console.log('ishost1', this.isHost);
        });
        return promise;
    }
    leaveLobby() {
        if(this.lobby) {
            this.lobby.leave();
            this.lobby = null;
            this.isHost = false;
        }
    }
    openGamePage() {
        this.client.overlay.activateToWebPage('https://www.example.com/');
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
        let steamPlayers = this.lobby.getMembers();
        if(steam.isHost) {
            steam.yukineServer = new YukineServer(steamPlayers);
        }
        steam.yukineClient = new YukineClient(steamPlayers);
    }
}