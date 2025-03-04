class GameView {
    showGame() {
        windows.setWindow(windows.windows.game);
        steam.lobbyClient.yukineClient.info.subscribe((oldValue, newValue) => {
            document.getElementById('gameInfo').innerText = newValue;
        });
        steam.lobbyClient.yukineClient.round.subscribe((oldValue, newValue) => {
            document.getElementById('round').innerText = 'Round ' + newValue;
        });
        steam.lobbyClient.yukineClient.state.subscribe((oldValue, newValue) => {
            if(newValue === Yukine.gameState.OVER) {
                alert('Game ended');
            }
        });
        gameView.loadPlayers();
        gameView.loadPlayerHand();
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

        let handAmount = createDiv('handAmount');
        playerName.appendChild(handAmount);

        let playedCards = createDiv('cards', 'row');
        playerElement.appendChild(playedCards);
        this.placePile(player.played, playedCards);

        player.name.subscribeRead((oldValue, newValue) => {
            playerName.innerText = newValue;
        });
        player.hand.subscribeRead((oldValue, newValue) => {
            handAmount.innerText = '(' + newValue.cards.length + ')';
        });
        player.state.subscribeRead((oldValue, newValue) => {
            playerName.setAttribute('data-state', newValue);
        });
        player.eligible.subscribeRead((oldValue, newValue) => {
            if(playedCards.children.length === 0) return;
            if(newValue) {
                playedCards.children[playedCards.children.length - 1].setAttribute('data-eligible', newValue);
            } else {
                playedCards.children[playedCards.children.length - 1].removeAttribute('data-eligible');
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