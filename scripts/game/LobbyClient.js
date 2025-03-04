class LobbyClient extends Client {
    cardStyle = new ObservableValue('default');
    read = {
        botAmount: (value) => parseInt(value),
        players: (value) => JSON.parse(value),
        cardStyle: (value) => value,
        chat: (value) => value,
        host: (value) => value,
        state: (value) => value
    }
    constructor(lobby) {
        super(lobby, 'settings');
        this.initObservables();

        this.state.subscribe((oldValue, newValue) => {
            if(newValue === Yukine.lobbyState.INGAME) {
                this.yukineClient = new SteamYukineClient(lobby);
                gameView.showGame();
            }
        });
    }

    getPlayers() {
        return this.players;
    }
    joinLobby() {
        this.sendAction('join', steam.playerName);
    }
    addChatMessage(message) {
        this.sendAction('chat', message);
    }
}