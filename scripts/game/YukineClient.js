class YukineClient extends Yukine {
    constructor(props) {
        super(props);
        this.currentPlayer = new LobbyValue();
        this.deck = new LobbyValue();
        this.discardPile = new LobbyValue();
        this.round = new LobbyValue();
        this.saveableLoosers = new LobbyValue();
        this.winner = new LobbyValue();
        this.players = steam.lobby.getMembers().map(member => new PlayerClient(member.accountId));

        for(let player of this.players) {
            if(player.name.value === steam.playerName) {
                this.gamePlayer = player;
                break;
            }
        }

        this.readPlayers();
        this.readCurrentPlayer();
        this.readDeck();
        this.readDiscardPile();
        this.readRound();
        this.readSaveableLoosers();
        this.readWinner();
    }

    readPlayers() {
        for(let player of this.players) {
            if(player.hasUpdate()) player.update();
        }
    }
    readCurrentPlayer() {
        this.currentPlayer.setValue(this.readData(this.locations.currentPlayer));
    }
    readDeck() {
        this.deck.setValue(Pile.fromString(this.readData(this.locations.deck)));
    }
    readDiscardPile() {
        this.winner.setValue(Pile.fromString(this.readData(this.locations.winner)));
    }
    readRound() {
        this.round.setValue(this.readData(this.locations.round));
    }
    readSaveableLoosers() {
        this.saveableLoosers.setValue(this.readData(this.locations.saveableLoosers));
    }
    readWinner() {
        this.winner.setValue(this.readData(this.locations.winner));
    }

    sendUserData(key, value) {
        steam.lobby.setData(key + ":" + steam.playerSteamID, value);
    }
    sendAction(action, value) {
        this.sendUserData('action', action + ':' + value);
    }
    readData(key) {
        return steam.lobby.getData(key);
    }
    hasUpdate() {
        return steam.lobby.getData('update') === 'true';
    }

    update() {
        let updateFields = steam.lobby.getData('updatefields').split(',');
        for(let field of updateFields) {
            this['read' + field]();
        }
    }

    useTry() {
        this.sendAction('useTry', '');
    }

    cancelTry(playerID) {
        this.sendAction('cancelTry', playerID);
    }

    playCard(value, suit) {
        this.sendAction('playCard', value + ':' + suit);
    }
}