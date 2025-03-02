class GameView {
    startGame() {
        steam.lobbyServer.startGame();
        const loadGame = (oldValue, newValue) => {
            if(newValue === Yukine.gameState.ONGOING) {
                windows.setWindow(windows.windows.game);
                steam.lobbyClient.yukineClient.gameInfo.subscribeRead((oldValue, newValue) => {
                    document.getElementById('gameInfo').innerText = newValue;
                });
                steam.lobbyClient.yukineClient.round.subscribeRead((oldValue, newValue) => {
                    document.getElementById('round').innerText = 'Round ' + newValue;
                });
                gameView.loadPlayers();
                gameView.loadPlayerHand();
                steam.lobbyClient.gameState.unsubscribe(loadGame);
            }
        }
        steam.lobbyClient.gameState.subscribe(loadGame);
    }
    loadPlayers() {
        let playerList = document.getElementById('playerList');
        playerList.innerHTML = '';
        for(let player of steam.lobbyClient.yukineClient.players) {
            playerList.appendChild(this.loadPlayer(player));
        }
    }

    loadPlayer(player) {
        let playerElement = createDiv('row', 'player');
        let playerName = createDiv('playerName');
        playerElement.appendChild(playerName);

        let playedCards = createDiv('cards', 'row');
        playerElement.appendChild(playedCards);
        this.placePile(player.played, playedCards);

        player.name.subscribeRead((oldValue, newValue) => {
            playerName.innerText = newValue;
        });
        player.state.subscribeRead((oldValue, newValue) => {
            playerName.setAttribute('data-state', newValue);
            if(newValue === Yukine.playerState.ELIGIBLE) {
                if(playedCards.children.length === 0) return;
                if(newValue) {
                    playedCards.children[playedCards.children.length - 1].setAttribute('data-eligible', newValue);
                } else {
                    playedCards.children[playedCards.children.length - 1].removeAttribute('data-eligible');
                }
            }
        });
        steam.lobbyClient.yukineClient.currentPlayer.subscribe((oldValue, newValue) => {
            if(player.accountId === newValue) {
                playerName.setAttribute('data-turn', 'true');
            } else {
                playerName.removeAttribute('data-turn');
            }
        });
        return playerElement;
    }

    placePile(pile, container, onClick = null) {
        pile.subscribeRead((oldValue, newValue) => {
            container.innerHTML = '';
            for(let card of pile.value.cards) {
                let cardElement = createDiv('card', steam.lobbyClient.cardStyle.value);
                cardElement.setAttribute('data-value', card.value);
                cardElement.setAttribute('data-suit', card.suit);
                cardElement.innerText = card.valueString + ' ' + card.suitString;
                if(onClick) cardElement.addEventListener('click', () => {
                    onClick(card);
                });
                container.appendChild(cardElement);
            }
        });
    }

    loadPlayerHand() {
        let playerHand = document.getElementById('playerHand');
        this.placePile(steam.lobbyClient.yukineClient.gamePlayer.hand, playerHand, (card) => {
            steam.lobbyClient.yukineClient.playCard(card);
        });
    }
}