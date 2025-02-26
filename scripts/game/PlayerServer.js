class PlayerServer extends Player {
    constructor(steamID) {
        super(steamID);
        this.hand = new Pile();
        this.played = new Pile();
        this.tries = 3;
        this.eligible = true;
        this.lost = false;
        this.tryCanceled = false;
        this.updates = new Set();
        this.name = steam.lobby.getData(steamID.toString());
        this.writeName();
        this.writePlayed();
        this.writeTries();
        this.writeEligible();
        this.writeLost();
        this.writeTryCanceled();
    }
    writeHand() {
        this.writeData(this.locations.hand, this.hand.toString());
    }
    writePlayed() {
        this.writeData(this.locations.played, this.played.toString());
    }
    writeTries() {
        this.writeData(this.locations.tries, this.tries.toString());
    }
    writeEligible() {
        this.writeData(this.locations.eligible, this.eligible.toString());
    }
    writeLost() {
        this.writeData(this.locations.lost, this.lost.toString());
    }
    writeTryCanceled() {
        this.writeData(this.locations.tryCanceled, this.tryCanceled.toString());
    }
    writeName() {
        this.writeData(this.locations.name, this.name);
    }
    writeData(key, value) {
        steam.lobby.setData(this.steamID + Yukine.delimiters.player + key, value);
        if(!this.updates.has(key)) {
            this.updates.add(key);
            let updateString = "";
            for(let value of this.updates.values()) {
                updateString += value + Yukine.delimiters.update.length;
            }
            updateString = updateString.substring(0, updateString.length - Yukine.delimiters.update.length);
            steam.lobby.setData(this.steamID + Yukine.delimiters.player + 'updatefields', updateString);
            steam.lobby.setData(this.steamID + Yukine.delimiters.player + 'update', 'true');
        }
    }
    setEligible(value) {
        this.eligible = value;
        this.writeEligible();
    }
    setLost(value) {
        this.lost = value;
        this.writeLost();
    }
    clearUpdates() {
        this.updates.clear();
        steam.lobby.setData(this.steamID + Yukine.delimiters.player + 'updatefields', '');
        steam.lobby.setData(this.steamID + Yukine.delimiters.player + 'update', 'false');
    }
    lastPlayedCard() {
        return this.played.cards[this.played.cards.length - 1];
    }
    playCard(card) {
        this.hand.cards.splice(this.hand.cards.indexOf(card), 1);
        this.played.addCard(card);
    }

    readAction() {
        let actiondata = this.readUserData('action');
        return actiondata?.split(Yukine.delimiters.action);
    }
    clearAction() {
        this.writeData('action', '');
    }
    useTry() {
        this.tries--;
        this.writeTries();
    }
    giveCard(card) {
        this.hand.addCard(card);
        this.writeHand();
    }
    clearPlayed() {
        this.played.clear();
        this.writePlayed();
    }
}