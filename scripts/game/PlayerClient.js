class PlayerClient extends Client {
    read = {
        hand: (value) => Pile.fromString(value),
        played: (value) => Pile.fromString(value),
        tries: (value) => parseInt(value),
        tryCanceled: (value) => value === "true",
        turn: (value) => parseInt(value),
        isBot: (value) => value === "true",
    }
    constructor(lobby, accountId) {
        super(lobby, accountId);
        this.accountId = accountId;
        this.hand = new ObservableValue(new Pile());
        this.played = new ObservableValue(new Pile());
        this.tries = new ObservableValue();
        this.tryCanceled = new ObservableValue();
        this.name = new ObservableValue();
        this.state = new ObservableValue();
        this.turn = new ObservableValue();
        this.isBot = new ObservableValue();
    }
}