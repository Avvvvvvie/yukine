class YukineServer extends Server {
    write = {
        deck: (pile) => pile.toString(),
        discardPile: (pile) => pile.toString(),
        round: (value) => value.toString(),
        saveableLoosers: (value) => value.toString()
    }

    constructor(lobby) {
        super(lobby);

        let turn = 0;
        this.players = steam.lobbyServer.getPlayers().map(player => new PlayerServer(this.lobby, player.accountId, player.name, turn++, player.isBot));

        this.deck = Pile.createDeck();
        this.deck.shuffle();
        this.distributeCards(8);
        this.writeData('deck');

        this.setKey('currentPlayer', this.players[0].accountId);
        this.setKey('discardPile', new Pile());
        this.setKey('round', 0);
        this.setKey('saveableLoosers', 1);

        for(let player of this.players) {
            player.subscribe(this.checkPlayerActions.bind(this));
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

                    if(player.isBot) {
                        asyncTimeout(3000).then(() => {
                            this.nextTurn();
                        });
                    } else {
                        this.nextTurn();
                    }


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
        return this.players.find(player => player.accountId === this.currentPlayer);
    }
    nextTurn() {
        let turn = this.players.find(player => player.accountId === this.currentPlayer).turn;
        turn = turn === this.players.length - 1 ? 0 : turn + 1;
        let nextPlayer = this.players.find(player => player.turn === turn);
        this.setKey('currentPlayer', nextPlayer.accountId);

        if(turn === 0) {
            this.findRoundWinner();
            this.findLoosers();
            let totalWinner = this.findTotalWinner();
            if(totalWinner) {
                totalWinner.setKey('state', Yukine.playerState.TOTALWIN);
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

        const getPlayers = (obj) => sortedPlayers.slice(obj.start, obj.end + 1);
        const markEligible = (...streets) => {
            for(let street of streets) {
                for (let player of getPlayers(street)) {
                    player.setKey('eligible', true);
                }
            }
        }
        const setState = (status, players) => {
            for(let player of players) {
                player.setState(status);
            }
        }
        // triggers are at least 2 players but length < 3
        let triggers = streets.filter(obj => obj.players >= 2 && obj.length <= 2);
        let singles = streets.filter(obj => obj.players === 1);
        let duplicateStreets = streets.filter(obj => obj.length > 2 && obj.duplicates > 0);
        let cleanStreets = streets.filter(obj => obj.length > 2 && obj.duplicates === 0);

        // if a card ocurrs 4 times
        if([...cardOcurrences.values()].includes(4)) {
            this.handAroundHands();
            setState(Yukine.playerState.SWAP, sortedPlayers);
            // triggers and streets are eligible
            markEligible(triggers);
            markEligible(streets);
            return;
        }

        //if highest length is 1
        if(Math.max(...streetLengths) === 1) {
            if(cardOcurrences.get(0) === 1) {
                // 0 wins
                let winner = sortedPlayers.find(player => player.lastPlayedCard().value === 0);
                this.rewardWinner(winner,true, ...sortedPlayers);
                return;
            } else {
                // the highest card wins
                let winner = sortedPlayers[sortedPlayers.length - 1];
                // give played cards to winner
                this.rewardWinner(winner, false, ...sortedPlayers);
                return;
            }
        }



        // if highest length is 2
        if(Math.max(...streetLengths) === 2) {
            // noone wins
            for(let player of sortedPlayers) {
                player.setState(Yukine.playerState.NONE);
            }
            // triggers are eligible
            markEligible(triggers);
            return;
        }

        // if there are streets of length 2
        if(duplicateStreets.length > 0 || triggers.length > 0) {
            // noone wins
            setState(Yukine.playerState.NONE, sortedPlayers);
            // duplicates are eligible
            markEligible(duplicateStreets);
            // triggers (pairs) are eligible
            markEligible(triggers);
            return;
        }

        for(let other of cleanStreets) {
            // singles keep their cards
            setState(Yukine.playerState.KEEP, getPlayers(singles));
            let players = getPlayers(other);
            // winner is the highest card or if it ends with 2 then 2
            let winner;
            if(other[other.length - 1] === 2) {
                winner = players.find(player => player.lastPlayedCard().value === 2);
            } else {
                winner = players[players.length - 1];
            }

            this.rewardWinner(winner, false, ...players);
        }
    }

    rewardWinner(winner, aced, ...loosers) {
        let rewardCards = [];
        for(let player of loosers) {
            if(player === winner) continue;
            rewardCards = rewardCards.concat(this.takeLooserCards(player));
        }

        rewardCards = rewardCards.concat(winner.played.cards);
        winner.played.clear();
        winner.writeData('played');

        // remove highest card
        rewardCards = rewardCards.sort((a, b) => a.value - b.value);
        let highestCard = rewardCards.pop();
        this.discardPile.addCard(highestCard);

        // if aced, remove 1 card with value 0
        if(aced) {
            let zeroCard = rewardCards.find(card => card.value === 0);
            rewardCards.splice(rewardCards.indexOf(zeroCard), 1);
            this.discardPile.addCard(zeroCard);
        }

        this.writeData('discardPile');

        // give reward cards to winner
        for(let card of rewardCards) {
            winner.hand.addCard(card);
        }
        winner.writeData('hand');

        winner.setState(Yukine.playerState.WIN);
    }

    takeLooserCards(player) {
        let rewardCards = player.played.cards;
        player.played.clear();
        player.writeData('played');
        player.setState(Yukine.playerState.LOOSE);
        return rewardCards;
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