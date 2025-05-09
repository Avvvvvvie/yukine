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
        this.players = yukine.lobbyServer.getPlayers().map(player => new PlayerServer(this.lobby, player.accountId, player.name, turn++, player.isBot));

        this.deck = Pile.createDeck();
        this.deck.shuffle();
        this.distributeCards(8);

        this.writeData('deck');
        this.setKey('discardPile', new Pile());
        this.setKey('round', 0);
        this.setKey('saveableLoosers', 1);
        this.setKey('currentPlayer', this.players[0].accountId);
        this.setKey('state', Yukine.gameState.ONGOING);

        for(let player of this.players) {
            player.subscribe(this.checkPlayerActions.bind(this));
            player.setEligible(true);
        }
    }

    moderate(message) {
        this.setKey('info', message);
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
                    player.setEligible(false);

                    asyncTimeout(2000).then(() => {
                        this.nextTurn();
                    });

                    this.moderate(player.name + ' played ' + playerCard.toText());
                    break;
                case 'useTry':
                    this.useTry(player, value);
                    break;
                case 'cancelTry':
                    this.cancelTry(value);
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
        let lastTurn = this.getTurn().turn;
        let eligiblePlayers = this.players.filter(player => player.eligible === true);
        if(eligiblePlayers.length === 0) {
            let winner = this.findRoundWinner();
            if(winner) {
                this.findLoosers();
                this.updateGameState();
                lastTurn = winner.turn;
            }
            if(this.state !== Yukine.gameState.OVER) {
                this.setKey('round',this.round + 1);
                this.unCancelPlayers();
                // the winner of the round starts the next round
                let nextPlayer = this.players.find(player => player.state === Yukine.playerState.WIN);
                if(nextPlayer) {
                    this.setNextPlayer(nextPlayer);
                } else {
                    // find player after last player
                    let potentialPlayers = this.players.filter(player => player.eligible);
                    if(potentialPlayers.length) {
                        let potentialPlayersAfter = potentialPlayers.filter(player => player.turn > lastTurn)
                        if(potentialPlayersAfter.length === 0) {
                            this.setNextPlayer(potentialPlayers[0]);
                        } else {
                            this.setNextPlayer(potentialPlayersAfter[0]);
                        }
                    } else {
                        console.log("no potential players?");
                    }
                }
            }
        } else {
            let eligiblePlayersAfter = eligiblePlayers.filter(player => player.turn > lastTurn);
            if(eligiblePlayersAfter.length === 0) {
                this.setNextPlayer(eligiblePlayers[0]);
            } else {
                this.setNextPlayer(eligiblePlayersAfter[0]);
            }
        }
    }

    handleRecursion() {
        this.handAroundHands();
        for(let player of this.players) {
            player.setState(Yukine.playerState.SWAP);
            this.moderate('Recursion: Everyone swaps hands');
            asyncTimeout(3000).then(() => {
                this.nextTurn();
            });
        }
    }

    setNextPlayer(player) {
        asyncTimeout(1000).then(() => {
            this.setKey('currentPlayer', player.accountId);
            if(player.hand.size() === 0) {
                this.moderate(player.name + ' has no cards left');
                this.nextTurn();
            }
        });
    }

    updateGameState() {
        let playerCount = 0;
        for(let player of this.players) {
            if(player.state !== Yukine.playerState.TOTALLOOSE) {
                playerCount++;
            }
        }
        if(this.players.length > 2 && playerCount === 2 && this.state === Yukine.gameState.ONGOING) {
            this.setKey('state', Yukine.gameState.ENDGAME);
            this.startEndGame();
        } else if(playerCount === 1) {
            let winner = this.players.find(player => player.state !== Yukine.playerState.TOTALLOOSE);
            winner.setKey('state', Yukine.playerState.TOTALWIN);
            this.setKey('state', Yukine.gameState.OVER);
        }
    }

    startEndGame() {
        let endGamePlayers = this.players.filter(player => player.state !== Yukine.playerState.TOTALLOOSE).sort((a, b) => a.hand.size() - b.hand.size());
        let cardAmount = endGamePlayers[0].hand.size();
        // remove random cards from players with more cards
        let ridCards = 0;
        while(endGamePlayers[1].hand.size() > cardAmount) {
            ridCards++;
            let player = endGamePlayers[1];
            let card = player.hand.cards[Math.floor(Math.random() * player.hand.size())];
            player.hand.cards.splice(player.hand.cards.indexOf(card), 1);
            this.discardPile.addCard(card);

            this.writeData('discardPile');
            player.writeData('hand');
        }
        this.moderate('Endgame started, ' + endGamePlayers[1].name + ' had to get rid of ' + ridCards +' cards');
        endGamePlayers[0].setEligible(true);
        endGamePlayers[1].setEligible(true);
    }

    findLoosers() {
        let loosersSaved = false;
        for(let player of this.players) {
            if(player.state === Yukine.playerState.TOTALLOOSE) continue;
            if(player.hand.size() === 0) {
                if(this.saveableLoosers > 0) {
                    loosersSaved = true;
                    this.giveCardToPlayer(player);
                } else {
                    player.setState(Yukine.playerState.TOTALLOOSE);
                    player.setEligible(false);
                }
            }
        }
        if(loosersSaved) {
            this.setKey('saveableLoosers', this.saveableLoosers - 1);
        }
    }
    findRoundWinner() {
        let sortedPlayers = this.players.filter(player => player.state !== Yukine.playerState.TOTALLOOSE && player.lastPlayedCard() !== undefined).sort((a, b) => (a.lastPlayedCard().value || -1) - b.lastPlayedCard().value);
        let sortedPlayerCards = sortedPlayers.map(player => player.lastPlayedCard().value);
        let cardOccurrences = sortedPlayerCards.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());

        let streets = [];
        let streetStart = 0;
        let duplicates = 0;
        for(let currentPlayer = 0; currentPlayer <= sortedPlayerCards.length - 2; currentPlayer++) {
            if(sortedPlayerCards[currentPlayer] === sortedPlayerCards[currentPlayer + 1]) {
                duplicates++;
            } else if(sortedPlayerCards[currentPlayer] === sortedPlayerCards[currentPlayer + 1] - 1) {
            } else {
                streets.push({
                    start: streetStart,
                    end: currentPlayer,
                    players: currentPlayer - streetStart + 1,
                    length: currentPlayer - streetStart + 1 - duplicates,
                    duplicates: duplicates
                });
                streetStart = currentPlayer + 1;
                duplicates = 0;
            }
        }
        streets.push({
            start: streetStart,
            end: sortedPlayerCards.length - 1,
            players: sortedPlayerCards.length - streetStart,
            length: sortedPlayerCards.length - streetStart - duplicates,
            duplicates: duplicates
        });

        if(sortedPlayerCards[0] === 2) {
            let duplicates = -1;
            for(let currentCard = 1; currentCard <= sortedPlayerCards.length - 3; currentCard++) {
                if(sortedPlayerCards[currentCard] === 14) {
                    duplicates++;
                }
            }

            for(let currentStreet = streets.length - 1; currentStreet >= 0; currentStreet--) {
                if(streets[currentStreet].end === sortedPlayerCards.length - 1 && sortedPlayerCards[sortedPlayerCards.length - 1] === 14) {
                    streets[currentStreet].players += duplicates + 1;
                    streets[currentStreet].length++;
                    streets[currentStreet].duplicates += duplicates;
                    streets[currentStreet].end = duplicates;
                }
            }
        }

        const getPlayers = (obj) => sortedPlayers.slice(obj.start, obj.end + 1);
        const markEligible = (...streets) => {
            for(let street of streets) {
                for (let player of getPlayers(street)) {
                    player.setEligible(true);
                }
            }
        }
        const markUnEligible = (...streets) => {
            for(let street of streets) {
                for (let player of getPlayers(street)) {
                    player.setEligible(false);
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
        let allTriggers = streets.filter(obj => obj.players >= 2);

        let aceTwoDuplicateStreets = duplicateStreets.filter(obj => obj.contains(14) && obj.contains(2));
        // aceTwoDuplicateStreets belong to clean Streets
        if(aceTwoDuplicateStreets.length > 0) {
            duplicateStreets = duplicateStreets.filter(obj => !aceTwoDuplicateStreets.includes(obj));
            cleanStreets = cleanStreets.concat(aceTwoDuplicateStreets);
        }

        // if there is endless triggering
        // aka if the only triggers are players with no cards
        let noCardsPlayers = this.players.filter(player => player.hand.size() === 0);
        let cardsPlayers = this.players.filter(player => player.hand.size() > 0);
        let triggerNoCardsPlayers = noCardsPlayers.filter(player => allTriggers.find(obj => getPlayers(obj).includes(player)));
        let triggerCardsPlayers = cardsPlayers.filter(player => allTriggers.find(obj => getPlayers(obj).includes(player)));
        if(triggerNoCardsPlayers > 2 && triggerCardsPlayers === 0) {
            this.handleRecursion();
            return;
        }

        // if a card Occurrs 4 times
        if([...cardOccurrences.values()].includes(4) || (this.players.length === 3 && [...cardOccurrences.values()].includes(3))) {
            this.handAroundHands();
            setState(Yukine.playerState.SWAP, sortedPlayers);
            // triggers and streets are eligible
            markEligible(...triggers);
            markEligible(...streets);
            // singles are uneligible
            markUnEligible(...singles);
            this.moderate(([...cardOccurrences.values()].includes(4) ? "4" : "3") + " of a kind, everyone swaps hands");
            return;
        }

        // if there are only singles
        if(triggers.length === 0 && duplicateStreets.length === 0 && cleanStreets.length === 0) {
            if(cardOccurrences.get(0) === 1) {
                // 0 wins
                let winner = sortedPlayers.find(player => player.lastPlayedCard().value === 0);
                this.rewardWinner(winner,true, ...sortedPlayers);
                // everyone is eligible
                for(let player of sortedPlayers) {
                    player.setEligible(true);
                }
                this.moderate(winner.name + ' won with a 2 beating the ace.');
                return winner;
            } else {
                // the highest card wins
                let winner = sortedPlayers[sortedPlayers.length - 1];
                // give played cards to winner
                this.rewardWinner(winner, false, ...sortedPlayers);
                // everyone is eligible
                for(let player of sortedPlayers) {
                    player.setEligible(true);
                }
                this.moderate(winner.name + ' won with the highest card.');
                return winner;
            }
        }

        // if there are triggers or duplicates
        if(triggers.length > 0 || duplicateStreets.length > 0) {
            // noone wins
            setState(Yukine.playerState.NONE, sortedPlayers);
            // duplicates are eligible
            markEligible(...duplicateStreets);
            // triggers (pairs) are eligible
            markEligible(...triggers);
            // singles are uneligible
            markUnEligible(...singles);
            this.moderate('The round continues');
            return;
        }

        // if there are no triggers or duplicates
        let winner;
        for(let other of cleanStreets) {
            // winner is the highest card or if it ends with 2 then 2
            let players = getPlayers(other);
            if(other[other.length - 1] === 2) {
                winner = players.find(player => player.lastPlayedCard().value === 2);
            } else {
                winner = players[0];
            }

            winner.setState(Yukine.playerState.WIN);
            winner.played.clear();
            winner.writeData('played');
            setState(Yukine.playerState.LOOSE, players.filter(player => player !== winner));

            this.rewardWinner(winner, false, ...players);

            this.moderate(winner.name + ' won with a street of ' + other.length + ' cards.');
        }
        // singles keep their cards
        for(let single of singles) {
            for(let player of getPlayers(single)) {
                player.setState(Yukine.playerState.KEEP);
                player.retakeCards();
            }
        }
        // everyone is eligible
        for(let player of sortedPlayers) {
            player.setEligible(true);
        }

        // just some winner continues for now. it should be the one that is the closest to the last turn
        return winner;
    }

    rewardWinner(winner, aced, ...loosers) {
        let rewardCards = [];
        for(let player of loosers) {
            if(player === winner) continue;
            rewardCards = rewardCards.concat(this.takeLooserCards(player));
            player.setState(Yukine.playerState.LOOSE);
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
        this.remove4SameCards(winner);
        winner.writeData('hand');

        winner.setState(Yukine.playerState.WIN);
    }

    remove4SameCards(player) {
        let cards = player.hand.cards;
        let cardOccurrences = cards.reduce((acc, e) => acc.set(e.value, (acc.get(e.value) || 0) + 1), new Map());
        let fourSameCards = [...cardOccurrences.entries()].filter(([key, value]) => value === 4);
        for(let [key, value] of fourSameCards) {
            let fourCards = cards.filter(card => card.value === key);
            for(let card of fourCards) {
                cards.splice(cards.indexOf(card), 1);
                this.discardPile.addCard(card);
            }
        }
        return false;
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
            let rightPlayer = currentPlayer === this.players.length - 1 ? 0 : currentPlayer + 1;
            this.players[currentPlayer].hand = this.players[rightPlayer].hand;
            this.players[currentPlayer].writeData('hand');
        }
    }

    giveCardToPlayer(player) {
        player.giveCard(this.deck.drawCard());
        this.writeData('deck');
    }
    useTry(player, tryName) {
        if(player.tries.length === 0) return;
        if(player.tryCanceled) return;
        //if(player.hand.cards.length !== 1) return;
        if(player.useTry(tryName)) {
            this.giveCardToPlayer(player);
        }
    }
    cancelTry(accountId) {
        let player = this.players.find(player => player.accountId === accountId);
        if(player) {
            player.setKey('tryCanceled', true);
        }
    }
    unCancelPlayers() {
        for(let player of this.players) {
            player.setKey('tryCanceled', false);
        }
    }
}