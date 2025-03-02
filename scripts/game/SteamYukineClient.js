class SteamYukineClient extends YukineClient {
    constructor(lobby) {
        super(lobby);

        this.initPlayers();
        this.startSubscription()
    }
}