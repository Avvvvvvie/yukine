class Client {
    read = {
        deck: (value) => Pile.fromString(value),
        discardPile: (value) => Pile.fromString(value),
        round: (value) => parseInt(value),
        saveableLoosers: (value) => parseInt(value),
        currentPlayer: (value) => parseInt(value),
        winner: (accountId) => this.players.filter(player => player.accountId === accountId)
    }
    constructor(path = '') {
        this.updateClient = new UpdateClient(path);

    }
    startSubscription() {
        this.updateClient.subscribe(this.updateKey.bind(this));
    }
    updateKey(key, value) {
        this[key].setValue(this.read[key] ? this.read[key](value) : value);
        console.log(key + ": " + value);
    }
}