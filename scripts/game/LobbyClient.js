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
    startGame() {
        this.yukineClient = new SteamYukineClient(this.lobby);
    }
}