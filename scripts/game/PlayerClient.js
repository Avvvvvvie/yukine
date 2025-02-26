class PlayerClient extends Player {
    constructor(steamID) {
        super(steamID);
        this.hand = new ObservableValue();
        this.played = new ObservableValue();
        this.tries = new ObservableValue();
        this.eligible = new ObservableValue();
        this.lost = new ObservableValue();
        this.tryCanceled = new ObservableValue();
        this.name = new ObservableValue();

        this.readHand();
        this.readPlayed();
        this.readTries();
        this.readEligible();
        this.readLost();
        this.readTryCanceled();
        this.readName();
    }

    readHand() {
        this.hand.setValue(Pile.fromString(this.readUserData(this.locations.hand)));
    };
    readPlayed() {
        this.played.setValue(Pile.fromString(this.readUserData(this.locations.played)?.split(Yukine.delimiters.pile)));
    }
    readTries() {
        this.tries.setValue(this.readUserData(this.locations.tries));
    }
    readEligible() {
        this.eligible.setValue(this.readUserData(this.locations.eligible));
    }
    readLost() {
        this.lost.setValue(this.readUserData(this.locations.lost));
    }
    readTryCanceled() {
        this.tryCanceled.setValue(this.readUserData(this.locations.canceled));
    }
    readName() {
        this.name.setValue(this.readUserData(this.locations.name));
    }
    hasUpdate() {
        return steam.lobby.getData('update') === 'true';
    }
    update() {
        let updateFields = this.readUserData('updatefields').split(Yukine.delimiters.update);
        for(let field of updateFields) {
            this['read' + field]();
        }
    }
}