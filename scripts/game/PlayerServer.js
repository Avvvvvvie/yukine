class PlayerServer extends Server {
    write = {
        hand: (value) => value.toString(),
        played: (value) => value.toString(),
        tries: (value) => value.toString(),
        eligible: (value) => value.toString(),
        lost: (value) => value.toString(),
        tryCanceled: (value) => value.toString()
    }
    constructor(accountId) {
        super(accountId);
        this.accountId = accountId;
        this.setKey('hand', new Pile());
        this.setKey('played', new Pile());
        this.setKey('tries', 3);
        this.setKey('eligible', true);
        this.setKey('lost', false);
        this.setKey('tryCanceled', false);
        this.setKey('name', steam.lobby.getData(accountId.toString()));
    }
    lastPlayedCard() {
        return this.played.cards[this.played.cards.length - 1];
    }
    playCard(card) {
        this.hand.cards.splice(this.hand.cards.indexOf(card), 1);
        this.played.addCard(card);
        this.writeData('played');
        this.writeData('hand');
    }

    useTry() {
        this.tries--;
        this.writeData('tries');
    }
    giveCard(card) {
        this.hand.addCard(card);
        this.writeData('hand');
    }
    clearPlayed() {
        this.played.clear();
        this.writeData('played');
    }
}