class YukineClient extends Yukine {
    constructor(props) {
        super(props);
        this.currentPlayer = new ObservableValue();
        this.deck = new ObservableValue();
        this.discardPile = new ObservableValue();
        this.round = new ObservableValue();
        this.saveableLoosers = new ObservableValue();
        this.winner = new ObservableValue();
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

        this.clientLoop();
    }

    clientLoop() {
        setTimeout(() => {
            this.clientLoop();
            if(this.hasUpdate()) this.update();
        }, 3000);
    }

    readPlayers() {
        for(let player of this.players) {
            if(player.hasUpdate()) player.update();
        }
    }
    readCurrentPlayer() {
        this.currentPlayer.setValue(this.readData(this.locations.currentPlayer));
        console.log("currentPlayer: " + this.currentPlayer.value);
    }
    readDeck() {
        this.deck.setValue(Pile.fromString(this.readData(this.locations.deck)));
    }
    readDiscardPile() {
        this.winner.setValue(Pile.fromString(this.readData(this.locations.winner)));
    }
    readRound() {
        this.round.setValue(this.readData(this.locations.round));
        console.log("round: " + this.round.value);
    }
    readSaveableLoosers() {
        this.saveableLoosers.setValue(this.readData(this.locations.saveableLoosers));
    }
    readWinner() {
        this.winner.setValue(this.readData(this.locations.winner));
    }

    sendPlayerData(key, value) {
        steam.lobby.setData(steam.playerSteamID + Yukine.delimiters.player + key, value);
    }
    sendAction(action, value) {
        this.sendPlayerData('action', action + Yukine.delimiters.action + value);
    }
    readData(key) {
        return steam.lobby.getData(key);
    }
    hasUpdate() {
        return steam.lobby.getData('update') === 'true';
    }

    update() {
        let updateFields = steam.lobby.getData('updatefields').split(Yukine.delimiters.update);
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

    playCard(card) {
        this.sendAction('playCard', card.toString());
    }
}