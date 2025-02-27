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
                    if(player.loosesCards) {
                        // give cards to winner
                        for(let card of player.played.cards) {
                            roundWinner.giveCard(card);
                        }
                        player.clearPlayed();
                    } else {
                        // give back cards into hand
                        for(let card of player.played.cards) {
                            player.giveCard(card);
                        }
                        player.clearPlayed();
                        // explicitly not loosing cards
                        player.setKey('loosesCards', false);
                    }

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

        let streetLength = 0;
        let longestStreet = 0;
        let longestStreetPlayer = null;
        let currentPlayer= this.players.length - 1

        let allSame = true;

        for(currentPlayer; currentPlayer >= 1; currentPlayer--) {
            if(sortedPlayers[currentPlayer - 1] + 1 === sortedPlayers[currentPlayer]){
                streetLength++;
                if(streetLength > longestStreet) {
                    longestStreet = streetLength;
                    longestStreetPlayer = sortedPlayers[currentPlayer - 1];
                }
            } else {
                if(allSame && sortedPlayers[currentPlayer] !== sortedPlayers[currentPlayer - 1]) {
                    allSame = false;
                }
                streetLength = 0;
            }
        }
        // case: there is a street of 3 or more, the player at the lower end of the street wins
        // anyone not in the street does not have to give their cards to the winner
        if(longestStreet >= 3) {
            // only players in the street loose cards
            for(let currentPlayer = longestStreetPlayer; currentPlayer < longestStreetPlayer + longestStreet; currentPlayer++) {
                sortedPlayers[currentPlayer].setKey('loosesCards', true);
            }
            return sortedPlayers[longestStreetPlayer];
        }

        // case: everyone has the same card, everyone gets the hand of their right neighbor
        if(allSame) {
            this.handAroundHands();
            return null;
        }

        // case: noone has adjacent cards
        if(longestStreet === 0) {
            // everyone else looses cards
            for(let currentPlayer = 0; currentPlayer < this.players.length - 2; currentPlayer++) {
                sortedPlayers[currentPlayer].setKey('loosesCards', true);
            }
            return sortedPlayers[sortedPlayers.length - 1];
        }

        return null;
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