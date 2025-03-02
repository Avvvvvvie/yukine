class LobbyClient extends Client {
    cardStyle = new ObservableValue('default');
    read = {
        botAmount: (value) => parseInt(value),
        players: (value) => JSON.parse(value),
    }
    constructor(lobby) {
        super(lobby, 'settings');

        this.botAmount = new ObservableValue();
        this.cardStyle = new ObservableValue();
        this.gameState = new ObservableValue();
        this.players = new ObservableValue([]);
        this.chat = new ObservableValue('');
        this.host = new ObservableValue();

        this.gameState.subscribe((oldValue, newValue) => {
            if(newValue === Yukine.gameState.ONGOING) {
                this.yukineClient = new SteamYukineClient(lobby);
            }
        });

        this.startSubscription();
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