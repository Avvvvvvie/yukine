class YukineClient extends Client {
    read = {
        deck: (value) => Pile.fromString(value),
        discardPile: (value) => Pile.fromString(value),
        round: (value) => parseInt(value),
        saveableLoosers: (value) => parseInt(value),
        currentPlayer: (value) => parseInt(value),
        winner: (accountId) => this.players.filter(player => player.accountId === accountId)
    }
    constructor() {
        super();
        this.settings = new SettingsClient();

        this.currentPlayer = new ObservableValue();
        this.deck = new ObservableValue();
        this.discardPile = new ObservableValue();
        this.round = new ObservableValue();
        this.saveableLoosers = new ObservableValue();
        this.winner = new ObservableValue();
        this.roundWinner = new ObservableValue();

        this.updateClient.subscribe(this.updateKey.bind(this));

        this.players = steam.players.map(member => new PlayerClient(member.accountId.toString()));

        for(let player of this.players) {
            if(player.name.value === steam.playerName) {
                this.gamePlayer = player;
                break;
            }
        }
    }

    useTry() {
        this.sendAction('useTry', '');
    }

    cancelTry(playerID) {
        this.sendAction('cancelTry', playerID);
    }

    playCard(card) {
        this.sendAction('playCard', card.toString());
    }
    sendAction(action, value) {
        this.gamePlayer.updateClient.setAction(action, value);
    }
}