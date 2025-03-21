class BotYukineClient extends YukineClient {
    constructor(lobby, name) {
        super(lobby);
        this.playerAccountId = name;

        this.currentPlayer.subscribe((oldValue, newValue) => {
            if(newValue === this.playerAccountId) {
                this.playBotCard();
            }
        });

        this.initPlayers();

        this.gamePlayer.state.subscribe((oldValue, newValue) => {
            if(newValue === Yukine.playerState.SWAP && this.getCurrentPlayer() === this.playerAccountId) {
                this.playBotCard();
            }
        });

        this.startSubscription();
    }

    initPlayers() {
        this.players = yukine.lobbyClient.getPlayers().value.map(player => new BotPlayerClient(this.lobby, this.playerAccountId, player.accountId));
        this.findGamePlayer();
    }

    playBotCard() {
        let highestCard = this.gamePlayer.hand.value.cards.sort((a, b) => b.value - a.value)[0];
        if(highestCard) {
            this.playCard(highestCard);
        } else {
            console.log("Bot has no card to play");
        }
    }
}