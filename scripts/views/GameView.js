class GameView {
    startGame() {
        windows.setWindow(windows.windows.game);
        steam.startGame();

        gameView.loadPlayers();
        gameView.loadPlayerHand();
    }
    loadPlayers() {
        let playerList = document.getElementById('playerList');
        playerList.innerHTML = '';
        for(let player of steam.yukineClient.players) {
            let playerElement = document.createElement('div');
            playerElement.classList.add('row');
            let playerName = document.createElement('div');
            playerList.appendChild(playerElement);
            playerElement.appendChild(playerName);
            player.name.subscribeRead((oldValue, newValue) => {
                playerName.innerText = newValue;
            });
            let playedCards = document.createElement('div');
            playedCards.classList.add('row');
            playerElement.appendChild(playedCards);
            this.placePile(player.played, playedCards);
        }
    }

    placePile(pile, container, onClick = null) {
        pile.subscribeRead((oldValue, newValue) => {
            container.innerHTML = '';
            for(let card of pile.value.cards) {
                let cardElement = document.createElement('div');
                cardElement.classList.add('card');
                if(steam.settings.cardStyle.value) cardElement.classList.add(steam.settings.cardStyle.value);
                cardElement.setAttribute('data-value', card.value);
                cardElement.setAttribute('data-suit', card.suit);
                cardElement.innerText = card.valueString + ' ' + card.suitString;
                if(onClick) cardElement.addEventListener('click', () => {
                    console.log('card clicked', card);
                    onClick(card);
                });
                container.appendChild(cardElement);
            }
        });
    }

    loadPlayerHand() {
        let playerHand = document.getElementById('playerHand');
        this.placePile(steam.yukineClient.gamePlayer.hand, playerHand, (card) => {
            steam.yukineClient.playCard(card);
        });
    }
}