class GameView {
    showGame(yukineClient) {
        this.yukineClient = yukineClient;
        pages.switchPage(pages.pages.game);
        this.yukineClient.info.subscribeRead((oldValue, newValue) => {
            document.getElementById('gameInfo').innerText = newValue;
        });
        this.yukineClient.round.subscribeRead((oldValue, newValue) => {
            document.getElementById('round').innerText = 'Round ' + newValue;
        });
        this.yukineClient.state.subscribeRead((oldValue, newValue) => {
            if(newValue === Yukine.gameState.OVER) {
                console.log("Game ended");
            }
        });
        gameView.loadPlayers();
        gameView.loadPlayerHand();
    }
    loadPlayers() {
        let playerList = document.getElementById('playerList');
        playerList.innerHTML = '';
        for(let player of this.yukineClient.players) {
            this.loadPlayer(playerList, player);
        }
    }

    loadPlayer(container, player) {
        let playerInfo = createDiv('playerInfo');
        let playerName = createDiv('playerName');
        let playerState = createDiv('playerState');

        let handAmount = createDiv('handAmount');

        let playedCards = createDiv('cards', 'row');
        this.placePile(player.played, playedCards);

        player.name.subscribeRead((oldValue, newValue) => {
            playerName.innerText = newValue;
        });
        player.hand.subscribeRead((oldValue, newValue) => {
            switch (true) {
                case newValue.cards.length === 0:
                    handAmount.setAttribute('data-amount', '0');
                    break;
                case newValue.cards.length === 1:
                    handAmount.setAttribute('data-amount', '1');
                    break;
                case newValue.cards.length === 2:
                    handAmount.setAttribute('data-amount', '2');
                    break;
                default:
                    handAmount.setAttribute('data-amount', '3');
                    break;
            }
        });
        player.state.subscribeRead((oldValue, newValue) => {
            playerState.setAttribute('data-state', newValue);
        });
        player.eligible.subscribeRead((oldValue, newValue) => {
            if(playedCards.children.length === 0) return;
            if(newValue) {
                playedCards.children[playedCards.children.length - 1].setAttribute('data-eligible', newValue);
            } else {
                playedCards.children[playedCards.children.length - 1].removeAttribute('data-eligible');
            }
        });
        this.yukineClient.currentPlayer.subscribeRead((oldValue, newValue) => {
            if(player.accountId === newValue) {
                playerInfo.setAttribute('data-turn', 'true');
            } else {
                playerInfo.removeAttribute('data-turn');
            }
        });

        container.appendChild(playerInfo);
        playerInfo.appendChild(playerName);
        playerInfo.appendChild(handAmount);
        playerInfo.appendChild(playerState);
        container.appendChild(playedCards);
        console.log(container);
    }

    placePile(pile, container, onClick = null) {
        pile.subscribeRead((oldValue, newValue) => {
            container.innerHTML = '';
            for(let card of pile.value.cards) {
                let cardElement = createDiv('card', steam.lobbyClient.cardStyle.value);
                cardElement.setAttribute('data-value', card.value);
                cardElement.setAttribute('data-suit', card.suit);
                //cardElement.innerText = card.valueString + ' ' + card.suitString;
                if(onClick) cardElement.addEventListener('click', () => {
                    onClick(card);
                });
                container.appendChild(cardElement);
            }
        });
    }

    loadPlayerHand() {
        let playerHand = document.getElementById('playerHand');
        this.placePile(this.yukineClient.gamePlayer.hand, playerHand, this.playCard.bind(this));
    }

    playCard(card) {
        this.yukineClient.playCard(card);
    }
}