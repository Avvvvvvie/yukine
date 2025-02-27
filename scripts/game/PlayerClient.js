class PlayerClient extends Client {
    read = {
        hand: (value) => Pile.fromString(value),
        played: (value) => Pile.fromString(value),
        tries: (value) => parseInt(value),
        eligible: (value) => value === "true",
        lost: (value) => value === "true",
        tryCanceled: (value) => value === "true"
    }
    constructor(accountId) {
        super(accountId);
        this.accountId = accountId;
        this.hand = new ObservableValue(new Pile());
        this.played = new ObservableValue(new Pile());
        this.tries = new ObservableValue();
        this.eligible = new ObservableValue();
        this.lost = new ObservableValue();
        this.tryCanceled = new ObservableValue();
        this.name = new ObservableValue();
        this.roundWinner = new ObservableValue();
        this.loosesCards = new ObservableValue();
        this.cardStatus = new ObservableValue();

        this.name.setValue(steam.lobby.getData(accountId.toString()));

        this.startSubscription();
    }
}