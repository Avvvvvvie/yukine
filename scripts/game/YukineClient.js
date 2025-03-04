class YukineClient extends Client {
    read = {
        deck: (value) => Pile.fromString(value),
        discardPile: (value) => Pile.fromString(value),
        round: (value) => parseInt(value),
        saveableLoosers: (value) => parseInt(value),
        currentPlayer: value => value,
        state: value => value,
        info: value => value
    }
    constructor(lobby) {
        super(lobby);
        this.initObservables();
    }

    initPlayers() {
        this.players = steam.lobbyClient.getPlayers().value.map(player => new SteamPlayerClient(this.lobby, player.accountId));
        this.findGamePlayer()
    }

    findGamePlayer() {
        for(let player of this.players) {
            if(player.accountId === this.playerAccountId) {
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
        this.gamePlayer.sendAction(action, value);
    }
    getCurrentPlayer() {
        return this.players.find(player => player.accountId === this.currentPlayer.value);
    }
}