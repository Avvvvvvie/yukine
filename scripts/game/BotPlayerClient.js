class BotPlayerClient extends PlayerClient {
    constructor(lobby, playerAccountId, accountId) {
        super(lobby, accountId);
        this.playerAccountId = playerAccountId;

        this.startSubscription();
    }
}