class BotYukineClient extends YukineClient {
    constructor(lobby, name) {
        super(lobby);
        this.playerAccountId = name;

        this.currentPlayer.subscribe((oldValue, newValue) => {
            if(newValue === this.playerAccountId) {
                let highestCard = this.gamePlayer.hand.value.cards.sort((a, b) => b.value - a.value)[0];
                if(highestCard) {
                    this.playCard(highestCard);
                } else {
                    console.log("Bot has no card to play");
                }
            }
        });

        this.initPlayers();
        this.startSubscription();
    }

    initPlayers() {
        this.players = steam.lobbyClient.getPlayers().value.map(player => new BotPlayerClient(this.lobby, this.playerAccountId, player.accountId));
        this.findGamePlayer();
    }
}