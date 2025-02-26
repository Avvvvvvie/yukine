class GameView {
    startGame() {
        windows.setWindow(windows.windows.game);
        steam.startGame();
        gameView.loadPlayerHand();
        gameView.loadPlayers();

    }
    loadPlayers() {
        let playerList = document.getElementById('playerList');
        playerList.innerHTML = '';
        for(let player of steam.yukineClient.players) {
            let playerElement = document.createElement('div');
            playerElement.innerText = player.name.value;
            playerList.appendChild(playerElement);
        }
    }

    loadPlayerHand() {
        let playerHand = document.getElementById('playerHand');
        playerHand.innerHTML = '';
        for(let card of steam.yukineClient.gamePlayer.hand.value.cards) {
            let cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.setAttribute('data-value', card.value);
            cardElement.setAttribute('data-suit', card.suit);
            cardElement.innerText = card.valueString + ' ' + card.suitString;
            cardElement.addEventListener('click', () => {
                console.log('card clicked', card);
                steam.yukineClient.playCard(card);
            });
            playerHand.appendChild(cardElement);
        }
    }
}