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
            this.findRoundWinner();
            this.findLoosers();
            let totalWinner = this.findTotalWinner();
            if(totalWinner) {
                this.setKey('winner', totalWinner);
                return;
            }
            this.writeData('currentPlayer');
            this.setKey('round',this.round + 1);
            this.markEligiblePlayers();
            this.unCancelPlayers();
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
    findLoosers() {
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
        let sortedPlayers = this.players.sort((a, b) => a.lastPlayedCard().value - b.lastPlayedCard().value);
        let cardOcurrences = sortedPlayers.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
        let streets = [];
        let streetStart = 0;
        let duplicates = 0;
        for(let currentPlayer = 0; currentPlayer <= sortedPlayers.length - 2; currentPlayer++) {
            if(sortedPlayers[currentPlayer] !== sortedPlayers[currentPlayer + 1] + 1){
                streets.push({
                    start: streetStart,
                    end: currentPlayer,
                    players: currentPlayer - streetStart + 1,
                    length: currentPlayer - streetStart + 1 - duplicates,
                    duplicates: duplicates
                });
                streetStart = currentPlayer + 1;
                duplicates = 0;
            } else if(sortedPlayers[currentPlayer] === sortedPlayers[currentPlayer + 1] + 1) {
                duplicates++;
            }
        }

        if(sortedPlayers[0] === 2) {
            let duplicates = 0;
            for(let currentPlayer = 1; currentPlayer <= sortedPlayers.length - 3; currentPlayer++) {
                if(sortedPlayers[currentPlayer] === 2) {
                    duplicates++;
                }
            }

            for(let currentStreet = streets.length - 1; currentStreet >= 0; currentStreet--) {
                if(streets[currentStreet].end === sortedPlayers.length - 1) {
                    streets[currentStreet].players += duplicates + 1;
                    streets[currentStreet].length++;
                    streets[currentStreet].duplicates += duplicates;
                    streets[currentStreet].end = duplicates;
                }
            }
        }


        let streetLengths = streets.map(obj => obj.length);

        //if highest length is 1
        if(Math.max(...streetLengths) === 1) {
            if(cardOcurrences.get(0) === 1) {
                // card 0 wins
                let winner = sortedPlayers.find(player => player.lastPlayedCard().value === 0);
                // give played cards to winner
                for(let player of sortedPlayers) {
                    if(player === winner) continue;
                    winner.giveCards(player.played);
                    player.writeData('played');
                    player.setCardStatus(Yukine.cardStatus.LOOSE);
                }
                return;
            } else {
                // the highest card wins
                let winner = sortedPlayers[sortedPlayers.length - 1];
                // give played cards to winner
                for(let player of sortedPlayers) {
                    if(player === winner) continue;
                    winner.giveCards(player.played);
                    player.writeData('played');
                    player.setCardStatus(Yukine.cardStatus.LOOSE);
                }
                return;
            }
        }

        const getPlayers = (obj) => sortedPlayers.slice(obj.start, obj.end + 1);
        // triggers are at least 2 players but length < 3
        let triggers = streets.filter(obj => obj.players >= 2 && obj.length <= 2);

        // if highest length is 2
        if(Math.max(...streetLengths) === 2) {
            // noone wins
            for(let player of sortedPlayers) {
                player.setCardStatus(Yukine.cardStatus.NONE);
            }
            // triggers are eligible
            for(let trigger of triggers) {
                for(let player of getPlayers(trigger)) {
                    player.setKey('eligible', true);
                }
            }
            return;
        }

        let singles = streets.filter(obj => obj.players === 1);
        let duplicateStreets = streets.filter(obj => obj.length > 2 && obj.duplicates > 0);
        let cleanStreets = streets.filter(obj => obj.length > 2 && obj.duplicates === 0);

        // if there are streets of length 2
        if(duplicateStreets.length > 0 || triggers.length > 0) {
            // noone wins
            for(let player of sortedPlayers) {
                player.setCardStatus(Yukine.cardStatus.NONE);
            }
            // duplicates are eligible
            for(let street of duplicateStreets) {
                for(let player of getPlayers(street)) {
                    player.setKey('eligible', true);
                }
            }
            // pairs are eligible
            for(let street of cleanStreets) {
                for (let player of getPlayers(street)) {
                    player.setKey('eligible', true);
                }
            }
            return;
        }

        for(let other of cleanStreets) {
            // singles keep their cards
            for(let player of getPlayers(singles)) {
                player.setCardStatus(Yukine.cardStatus.KEEP);
            }
            let players = getPlayers(other);
            // winner is the highest card or if it ends with 2 then 2
            let winner;
            if(other[other.length - 1] === 2) {
                winner = players.find(player => player.lastPlayedCard().value === 2);
            } else {
                winner = players[players.length - 1];
            }
            for(let player of players) {
                if(player === winner) {
                    player.setCardStatus(Yukine.cardStatus.WIN);
                } else {
                    // give played cards to first player
                    winner.giveCards(player.played);
                    player.writeData('played');
                    player.setCardStatus(Yukine.cardStatus.LOOSE);
                }
            }
        }
    }
    handAroundHands() {
        for(let currentPlayer = 0; currentPlayer < this.players.length; currentPlayer++) {
            let rightPlayer = currentPlayer === this.players.length - 1 ? 0 : currentPlayer;
            this.players[currentPlayer].hand = this.players[rightPlayer].hand;
        }
    }

    giveCardToPlayer(player) {
        player.giveCard(this.deck.drawCard());
        this.writeData('deck');
    }
    useTry(player) {
        if(player.tries <= 0) return;
        if(player.tryCanceled) return;
        player.useTry();
        this.giveCardToPlayer(player);
    }
    cancelTry(player) {
        player.setKey('tryCanceled', true);
    }
    unCancelPlayers() {
        for(let player of this.players) {
            player.setKey('tryCanceled', false);
        }
    }
}