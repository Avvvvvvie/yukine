class YukineServer extends Server {
    write = {
        deck: (pile) => pile.toString(),
        discardPile: (pile) => pile.toString(),
        round: (value) => value.toString(),
        saveableLoosers: (value) => value.toString(),
        currentPlayer: (value) => value.toString(),
        winner: (player) => player.accountId
    }

    constructor() {
        super();

        this.players = steam.players.map(player => new PlayerServer(player.accountId.toString()));

        this.deck = Pile.createDeck();
        this.deck.shuffle();
        this.distributeCards(8);
        this.writeData('deck');

        this.setKey('currentPlayer', 0);
        this.setKey('discardPile', new Pile());
        this.setKey('round', 0);
        this.setKey('saveableLoosers', 1);

        for(let player of this.players) {
            player.updateServer.subscribe(this.checkPlayerActions.bind(this));
        }
    }

    checkPlayerActions(playerId, action, value) {
        for(let player of this.players) {
            if(player.accountId !== playerId.toString()) continue;
            switch (action) {
                case 'playCard':
                    if(this.getTurn().accountId !== player.accountId) break;
                    let sentCard = Card.fromString(value);
                    let playerCard = player.hand.cards.find(card => card.value === sentCard.value && card.suit === sentCard.suit);
                    if(playerCard === undefined) break;
                    player.playCard(playerCard);
                    this.nextTurn();
                    break;
                case 'try':
                    this.useTry(player);
                    break;
                case 'canceltry':
                    this.cancelTry(player);
                    break;
            }
        }
    }

    distributeCards(amount) {
        for(let player of this.players) {
            for(let i = 0; i < amount; i++) {
                player.giveCard(this.deck.drawCard());
            }
        }
        this.writeData('deck');
    }

    getTurn() {
        return this.players[this.currentPlayer];
    }
    nextTurn() {
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        if(this.currentPlayer === 0) {
            let roundWinner = this.findRoundWinner();
            if(roundWinner) {
                for(let player of this.players) {
                    for(let card of player.played.cards) {
                        roundWinner.giveCard(card);
                    }
                    player.clearPlayed();
                }
                this.setKey('roundWinner',roundWinner);
            }
            this.findRoundLoosers();
            let totalWinner = this.findTotalWinner();
            if(totalWinner) {
                this.setKey('winner', totalWinner);
                return null;
            }
            this.writeData('currentPlayer');
            this.setKey('round',this.round + 1);
            this.markEligiblePlayers();
        }
    }

    markEligiblePlayers() {
        for(let player1 of this.players) {
            for(let player2 of this.players) {
                if(player1 === player2) continue;
                if(player2.eligible === true && player1.eligible === true) continue;
                if(player1.lastPlayedCard().value + 1 > player2.lastPlayedCard().value && player1.lastPlayedCard().value - 1 < player2.lastPlayedCard().value) {
                    player1.setKey('eligible',true);
                    player2.setKey('eligible',true);
                    break;
                }
            }
        }
    }
    findRoundLoosers() {
        for(let player of this.players) {
            if(player.hand.size() === 0) {
                if(this.saveableLoosers > 0) {
                    this.setKey('saveableLoosers', this.saveableLoosers - 1);
                    this.giveCardToPlayer(player);
                } else {
                    player.setKey('lost',true);
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
    giveCardToPlayer(player) {
        player.giveCard(this.deck.drawCard());
        this.writeData('deck');
    }
    useTry(player) {
        player.useTry();
        this.giveCardToPlayer(player);
    }
    cancelTry(player) {
        player.setKey('tryCanceled', true);
    }
}