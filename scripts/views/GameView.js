class GameView extends View {
    DOMContentLoaded() {

    }

    init(yukineClient) {
        this.yukineClient = yukineClient;
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
        this.loadPlayers();
        this.loadPlayerHand();
        pages.switchPage(pages.pages.game);
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
        container.appendChild(playerInfo);
        if(player === this.yukineClient.gamePlayer) {
            playerInfo.setAttribute('data-self', 'true');
        }
        this.yukineClient.currentPlayer.subscribeRead((oldValue, newValue) => {
            if(player.accountId === newValue) {
                playerInfo.setAttribute('data-turn', 'true');
            } else {
                playerInfo.removeAttribute('data-turn');
            }
        });
        player.tryCanceled.subscribeRead((oldValue, newValue) => {
            if(newValue) {
                playerInfo.setAttribute('data-canceled', 'true');
            } else {
                playerInfo.removeAttribute('data-canceled');
            }
        });

        let playerName = createDiv('playerName');
        playerInfo.appendChild(playerName);
        player.name.subscribeRead((oldValue, newValue) => {
            playerName.innerText = newValue;
        });

        let playedCards = createDiv('cards', 'row');
        this.placePile(player.played, playedCards);
        container.appendChild(playedCards);
        player.eligible.subscribeRead((oldValue, newValue) => {
            if(playedCards.children.length === 0) return;
            if(newValue) {
                playedCards.children[playedCards.children.length - 1].setAttribute('data-eligible', newValue);
            } else {
                playedCards.children[playedCards.children.length - 1].removeAttribute('data-eligible');
            }
        });

        let handAmount = createDiv('handAmount');
        playerInfo.appendChild(handAmount);
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

        for(let tryName of Yukine.tries) {
            let tryElement = createDiv('try');
            playerInfo.appendChild(tryElement);
            tryElement.setAttribute('data-try', tryName);
            player.tries.subscribeRead((oldValue, newValue) => {
                if(newValue.indexOf(tryName) === -1) {
                    tryElement.removeAttribute('data-used', 'false');
                } else {
                    tryElement.setAttribute('data-used', 'true');
                }
            });
            if(this.yukineClient.gamePlayer === player) {
                tryElement.addEventListener('click', () => {
                    this.yukineClient.useTry(tryName);
                });
                tryElement.classList.add('clickable');
            }
        }

        let cancelButton = createDiv('cancelTry');
        playerInfo.appendChild(cancelButton);
        cancelButton.addEventListener('click', () => {
           this.yukineClient.cancelTry(player.accountId);
        });

        let playerState = createDiv('playerState');
        playerInfo.appendChild(playerState);
        player.state.subscribeRead((oldValue, newValue) => {
            playerState.setAttribute('data-state', newValue);
        });
    }

    placePile(pile, container, onClick = null) {
        pile.subscribeRead((oldValue, newValue) => {
            container.innerHTML = '';
            for(let card of pile.value.cards) {
                let cardElement = createDiv('card', yukine.lobbyClient.cardStyle.value);
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