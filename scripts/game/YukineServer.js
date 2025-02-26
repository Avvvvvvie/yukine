class YukineServer extends Yukine {
    currentPlayer = 0;
    deck = Pile.createDeck();
    discardPile = new Pile();
    round = 0;
    saveableLoosers = 1;
    winner = null;
    constructor(players) {
        super();
        this.players = players.map(player => new PlayerServer(player.accountId));
        this.deck.shuffle();
        this.distributeCards(8);
        this.updates = new Set();

        this.writeCurrentPlayer();
        this.writeDeck();
        this.writeDiscardPile();
        this.writeRound();
        this.writeSaveableLoosers();
    }
    distributeCards(amount) {
        for(let player of this.players) {
            for(let i = 0; i < amount; i++) {
                this.giveCardToPlayer(player);
            }
        }
    }
    writeCurrentPlayer() {
        this.writeData(this.locations.currentPlayer, this.currentPlayer.toString());
    }
    writeDeck() {
        this.writeData(this.locations.deck, this.deck.toString());
    }
    writeDiscardPile() {
        this.writeData(this.locations.discardPile, this.discardPile.toString());
    }
    writeRound() {
        this.writeData(this.locations.round, this.round.toString());
    }
    writeSaveableLoosers() {
        this.writeData(this.locations.saveableLoosers, this.saveableLoosers.toString());
    }
    writeWinner() {
        this.writeData(this.locations.winner, this.winner?.steamID.toString());
    }
    getTurn() {
        return this.players[this.currentPlayer];
    }
    writeData(key, value) {
        steam.lobby.setData(key, value);
        if(!this.updates.has(key)) {
            this.updates.add(key);
            let updateString = "";
            for(let value of this.updates.values()) {
                updateString += value + ",";
            }
            updateString = updateString.substring(0, updateString.length - 1);
            steam.lobby.setData('updatefields', updateString);
            steam.lobby.setData('update', 'true');
        }
    }
    nextTurn() {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        if(this.currentPlayer === 0) {
            let winner = this.findRoundWinner();
            if(winner) {
                for(let player of this.players) {
                    for(let card of player.played.cards) {
                        winner.hand.addCard(card);
                    }
                }
            }
            this.findRoundLoosers();
            let totalWinner = this.findTotalWinner();
            if(totalWinner) {
                this.winner = totalWinner;
                return null;
            }
            this.round++;
            this.markEligiblePlayers();
        }
    }
    markEligiblePlayers() {
        for(let player1 of this.players) {
            for(let player2 of this.players) {
                if(player1 === player2) continue;
                if(player2.eligible === true && player1.eligible === true) continue;
                if(player1.lastPlayedCard().value + 1 > player2.lastPlayedCard().value && player1.lastPlayedCard().value - 1 < player2.lastPlayedCard().value) {
                    player1.eligible = true;
                    player2.eligible = true;
                    break;
                }
            }
        }
    }
    findRoundLoosers() {
        for(let player of this.players) {
            if(player.hand.size() === 0) {
                if(this.saveableLoosers > 0) {
                    this.saveableLoosers--;
                    this.giveCardToPlayer(player);
                } else {
                    player.lost = true;
                }
            }
        }
    }
    findTotalWinner() {
        let notLostCount = 0;
        let winner = null;
        for(let player of this.players) {
            if(player.lost === false) {
                notLostCount++;
                winner = player;
            }
        }
        if(notLostCount === 1) {
            return winner;
        }
    }
    giveCardToPlayer(player) {
        player.hand.addCard(this.deck.drawCard());
        player.writeHand();
    }
    findRoundWinner() {
        let sortedPlayers = this.players.filter(player => player.eligible).sort((a, b) => a.lastPlayedCard().value - b.lastPlayedCard().value);
        // todo: check if everyone has the same card
        for(let i = 0; i < this.players.length - 1; i++) {
            if(!(sortedPlayers[sortedPlayers.length - i - 2] + 1 >= sortedPlayers[sortedPlayers.length - i - 1])){
                return sortedPlayers[sortedPlayers.length - i - 1];
            }
        }
        return null;
    }
    useTry(player) {
        player.tries--;
        this.giveCardToPlayer(player);
    }
    cancelTry(player) {
        player.tryCanceled = true;
    }
}