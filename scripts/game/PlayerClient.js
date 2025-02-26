class PlayerClient extends Player {
    constructor(steamID) {
        super(steamID);
        this.hand = new LobbyValue();
        this.played = new LobbyValue();
        this.tries = new LobbyValue();
        this.eligible = new LobbyValue();
        this.lost = new LobbyValue();
        this.tryCanceled = new LobbyValue();
        this.name = new LobbyValue();

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
        this.played.setValue(Pile.fromString(this.readUserData(this.locations.played)?.split(",")));
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
    readUserData(key) {
        return steam.lobby.getData(this.steamID + ':' + key);
    }
    hasUpdate() {
        return steam.lobby.getData('update') === 'true';
    }
    update() {
        let updateFields = this.readUserData('updatefields').split(',');
        for(let field of updateFields) {
            this['read' + field]();
        }
    }
}